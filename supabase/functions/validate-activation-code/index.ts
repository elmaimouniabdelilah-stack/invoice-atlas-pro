import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, deviceFingerprint } = await req.json();

    if (!code || !deviceFingerprint) {
      return new Response(JSON.stringify({ error: "missing_params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the activation code
    const { data: codeData, error: codeError } = await supabase
      .from("activation_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (codeError || !codeData) {
      return new Response(JSON.stringify({ error: "invalid_code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!codeData.is_active) {
      return new Response(JSON.stringify({ error: "code_disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this device is already activated with this code
    const { data: existing } = await supabase
      .from("device_activations")
      .select("id")
      .eq("code_id", codeData.id)
      .eq("device_fingerprint", deviceFingerprint)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_activated: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Count current activations for this code
    const { count } = await supabase
      .from("device_activations")
      .select("*", { count: "exact", head: true })
      .eq("code_id", codeData.id);

    if ((count ?? 0) >= codeData.max_devices) {
      return new Response(JSON.stringify({ error: "max_devices_reached", max: codeData.max_devices }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Activate device
    const { error: insertError } = await supabase
      .from("device_activations")
      .insert({ code_id: codeData.id, device_fingerprint: deviceFingerprint });

    if (insertError) {
      return new Response(JSON.stringify({ error: "activation_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
