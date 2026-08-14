import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
    const user = userData.user;

    // One trial code per account — return the existing one with its status
    const { data: existing } = await admin
      .from("activation_codes")
      .select("id, code, expires_at, is_active")
      .eq("owner_user_id", user.id)
      .eq("plan", "trial")
      .maybeSingle();

    if (existing) {
      const { count } = await admin
        .from("device_activations")
        .select("*", { count: "exact", head: true })
        .eq("code_id", existing.id);

      const expired = existing.expires_at
        ? new Date(existing.expires_at) < new Date()
        : false;

      return json({
        code: existing.code,
        expires_at: existing.expires_at,
        already_issued: true,
        used: (count ?? 0) > 0,
        status: !existing.is_active
          ? "disabled"
          : expired
          ? "expired"
          : (count ?? 0) > 0
          ? "used"
          : "active",
      });
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "TRIAL-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { data, error } = await admin
      .from("activation_codes")
      .insert({
        code,
        is_active: true,
        max_devices: 1,
        plan: "trial",
        expires_at: expiresAt.toISOString(),
        owner_user_id: user.id,
        owner_email: user.email,
      })
      .select("code, expires_at")
      .single();

    if (error) {
      // Unique index race — fetch existing
      const { data: retry } = await admin
        .from("activation_codes")
        .select("code, expires_at")
        .eq("owner_user_id", user.id)
        .eq("plan", "trial")
        .maybeSingle();
      if (retry) {
        return json({ ...retry, already_issued: true, status: "active" });
      }
      return json({ error: error.message }, 500);
    }

    return json({
      code: data.code,
      expires_at: data.expires_at,
      already_issued: false,
      used: false,
      status: "active",
    });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
