// ==============================================================================
// Edge Function: approve-deposit (Admin-Only)
// ==============================================================================
// Admin-only endpoint to approve or reject pending deposit transactions.
// Atomically increments user wallet balance upon approval and updates status.
// Uses `approve_deposit_atomic` stored procedure with row-level locks.
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ApproveDepositRequest {
  wallet_transaction_id: string;
  decision: "approved" | "rejected";
  admin_note?: string;
  admin_user_id?: string;
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSecret = Deno.env.get("ADMIN_SECRET");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ApproveDepositRequest = await req.json();
    const { wallet_transaction_id, decision, admin_note, admin_user_id } = body;

    if (!wallet_transaction_id || !decision) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: wallet_transaction_id and decision ('approved' | 'rejected') are required." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["approved", "rejected"].includes(decision)) {
      return new Response(
        JSON.stringify({ error: "Invalid decision. Must be 'approved' or 'rejected'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Security Check: Verify Admin Authorization
    // Method A: Check custom x-admin-secret header if set
    const reqAdminSecret = req.headers.get("x-admin-secret");
    let isAuthorized = false;

    if (adminSecret && reqAdminSecret && reqAdminSecret === adminSecret) {
      isAuthorized = true;
    }

    // Method B: Check if admin_user_id has role = 'admin' in database
    if (!isAuthorized && admin_user_id) {
      const { data: adminUser } = await supabase
        .from("users")
        .select("role")
        .eq("id", admin_user_id)
        .single();

      if (adminUser && adminUser.role === "admin") {
        isAuthorized = true;
      }
    }

    // Method C: Check JWT Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!isAuthorized && authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile && profile.role === "admin") {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized: Admin privileges required. Pass a valid admin JWT, admin_user_id with role='admin', or x-admin-secret header." 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Call atomic Postgres stored procedure
    const { data, error } = await supabase.rpc("approve_deposit_atomic", {
      p_transaction_id: wallet_transaction_id,
      p_decision: decision,
      p_admin_note: admin_note || null,
    });

    if (error) {
      console.error("approve-deposit atomic RPC error:", error);

      if (error.message.includes("already")) {
        return new Response(
          JSON.stringify({ success: false, error: error.message, code: "ALREADY_PROCESSED" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (error.code === "P0002" || error.message.includes("not found")) {
        return new Response(
          JSON.stringify({ success: false, error: "Transaction not found", code: "NOT_FOUND" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("approve-deposit error:", err);
    return new Response(
      JSON.stringify({ error: "Internal approval processing error", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
