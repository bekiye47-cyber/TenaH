// ==============================================================================
// Edge Function: purchase-item
// ==============================================================================
// Atomically checks user wallet balance, deducts funds, and logs the purchase
// inside an ACID Postgres transaction using the `purchase_item_atomic` RPC.
// Protects against race conditions, duplicate purchases, and double-spending.
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PurchaseRequest {
  user_id: string;
  item_type: "book" | "challenge";
  item_id: string;
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

    const body: PurchaseRequest = await req.json();
    const { user_id, item_type, item_id } = body;

    if (!user_id || !item_type || !item_id) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: user_id, item_type ('book'|'challenge'), item_id are required." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["book", "challenge"].includes(item_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid item_type. Must be 'book' or 'challenge'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase Client with Service Role Key for atomic execution
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call atomic PostgreSQL transaction procedure
    const { data, error } = await supabase.rpc("purchase_item_atomic", {
      p_user_id: user_id,
      p_item_type: item_type,
      p_item_id: item_id,
    });

    if (error) {
      console.error("Purchase atomic RPC error:", error);

      // Handle specific database constraint / balance errors
      if (error.message.includes("Insufficient wallet balance")) {
        return new Response(
          JSON.stringify({ success: false, error: error.message, code: "INSUFFICIENT_FUNDS" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (error.message.includes("already purchased") || error.code === "23505") {
        return new Response(
          JSON.stringify({ success: false, error: "You already own this item.", code: "ALREADY_OWNED" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (error.code === "P0002" || error.message.includes("not found")) {
        return new Response(
          JSON.stringify({ success: false, error: error.message, code: "NOT_FOUND" }),
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
    console.error("purchase-item error:", err);
    return new Response(
      JSON.stringify({ error: "Internal purchase processing error", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
