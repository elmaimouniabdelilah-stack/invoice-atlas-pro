import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Require a signed-in user
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return json({ error: "unauthorized" }, 401);
    const { data: userData } = await admin.auth.getUser(token);
    if (!userData?.user) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const deviceFingerprint = body?.deviceFingerprint;
    if (typeof deviceFingerprint !== "string" || deviceFingerprint.length < 4 || deviceFingerprint.length > 256) {
      return json({ error: "invalid_params" }, 400);
    }

    const { data: activations } = await admin
      .from("device_activations")
      .select("code_id")
      .eq("device_fingerprint", deviceFingerprint);

    if (!activations || activations.length === 0) {
      return json({ activated: false, subscription: null });
    }

    const { data: codes } = await admin
      .from("activation_codes")
      .select("code, is_active, expires_at")
      .in("id", activations.map((a: { code_id: string }) => a.code_id));

    const now = new Date();
    const valid = (codes ?? []).find(
      (c) => c.is_active && (!c.expires_at || new Date(c.expires_at) > now),
    );
    const fallback = valid ?? (codes ?? [])[0] ?? null;

    return json({
      activated: !!valid,
      subscription: fallback
        ? {
            code: fallback.code,
            isTrial: String(fallback.code).startsWith("TRIAL-"),
            expiresAt: fallback.expires_at,
            active: !!valid,
          }
        : null,
    });
  } catch (_err) {
    return json({ error: "internal_error" }, 500);
  }
});
