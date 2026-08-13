import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, service, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "unauthorized" }, 401);

    const { data: userData } = await admin.auth.getUser(token);
    const caller = userData?.user;
    if (!caller) return json({ error: "unauthorized" }, 401);

    const { data: callerRoles } = await admin
      .from("user_roles").select("role").eq("user_id", caller.id);
    const roles = (callerRoles ?? []).map((r: { role: string }) => r.role);
    const isSuper = roles.includes("super_admin");
    const isAdmin = isSuper || roles.includes("admin");
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const { action, userId, role, email } = await req.json();

    if (action === "list") {
      const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) throw error;
      const { data: allRoles } = await admin.from("user_roles").select("user_id, role");
      const users = list.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: (allRoles ?? []).filter((r: { user_id: string }) => r.user_id === u.id)
          .map((r: { role: string }) => r.role),
      }));
      return json({ users, isSuper });
    }

    if (!isSuper) return json({ error: "forbidden: super_admin required" }, 403);

    if (action === "grant" || action === "revoke") {
      let targetId = userId;
      if (!targetId && email) {
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
        targetId = list.users.find((u) => u.email?.toLowerCase() === String(email).toLowerCase())?.id;
      }
      if (!targetId) return json({ error: "user_not_found" }, 404);
      if (!["admin", "super_admin", "moderator", "user"].includes(role)) {
        return json({ error: "invalid_role" }, 400);
      }
      if (action === "revoke" && targetId === caller.id && role === "super_admin") {
        return json({ error: "cannot_revoke_self_super_admin" }, 400);
      }

      if (action === "grant") {
        const { error } = await admin.from("user_roles")
          .upsert({ user_id: targetId, role }, { onConflict: "user_id,role" });
        if (error) throw error;
      } else {
        const { error } = await admin.from("user_roles")
          .delete().eq("user_id", targetId).eq("role", role);
        if (error) throw error;
      }
      return json({ success: true });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
