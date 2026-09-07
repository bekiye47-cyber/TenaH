// ==============================================================================
// Edge Function: verify-telegram-init
// ==============================================================================
// Verifies Telegram Mini App WebApp initData string using Telegram's official
// HMAC-SHA256 validation algorithm.
//
// Secret requirement:
//   supabase secrets set TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyRequest {
  initData: string;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

// Convert ArrayBuffer to hex string
function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

// Timing-safe string comparison
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req: Request) => {
  // Handle CORS Preflight
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

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      console.error("Missing TELEGRAM_BOT_TOKEN in Supabase Secrets.");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error: TELEGRAM_BOT_TOKEN secret not set in Supabase." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: VerifyRequest = await req.json();
    const { initData } = body;

    if (!initData || typeof initData !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid initData string in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Parse query parameters from initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");

    if (!hash) {
      return new Response(
        JSON.stringify({ error: "Invalid initData: 'hash' parameter missing." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Extract and sort data_check_string according to Telegram docs
    // Exclude 'hash' and sort remaining keys alphabetically
    const dataCheckArr: string[] = [];
    urlParams.delete("hash");

    // Sort keys alphabetically
    const sortedKeys = Array.from(urlParams.keys()).sort();
    for (const key of sortedKeys) {
      const val = urlParams.get(key);
      if (val !== null) {
        dataCheckArr.push(`${key}=${val}`);
      }
    }
    const dataCheckString = dataCheckArr.join("\n");

    // 3. Compute secret key = HMAC_SHA256("WebAppData", botToken)
    const encoder = new TextEncoder();
    const webAppDataKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const secretKeyBuffer = await crypto.subtle.sign(
      "HMAC",
      webAppDataKey,
      encoder.encode(botToken)
    );

    // 4. Compute HMAC_SHA256(secretKeyBuffer, dataCheckString)
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      secretKeyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      hmacKey,
      encoder.encode(dataCheckString)
    );
    const calculatedHash = buf2hex(signatureBuffer);

    // 5. Compare signature securely
    const isValid = constantTimeCompare(calculatedHash, hash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: "Signature mismatch: Telegram initData is forged or expired." 
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Check replay attack window (auth_date freshness: max 24 hours old)
    const authDateStr = urlParams.get("auth_date");
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const MAX_AGE_SECONDS = 86400; // 24 hours
      if (currentTime - authDate > MAX_AGE_SECONDS) {
        return new Response(
          JSON.stringify({ 
            verified: false, 
            error: "Authentication session expired. Please reload Telegram Mini App." 
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 7. Parse verified Telegram User payload
    const userRaw = urlParams.get("user");
    let telegramUser: TelegramUser | null = null;
    if (userRaw) {
      try {
        telegramUser = JSON.parse(userRaw) as TelegramUser;
      } catch {
        console.warn("Failed to parse user JSON payload.");
      }
    }

    if (!telegramUser || !telegramUser.id) {
      return new Response(
        JSON.stringify({ verified: true, user: null, message: "Verified without user object." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Auto-upsert into Supabase public.users using Service Role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .upsert(
        {
          telegram_id: telegramUser.id,
          first_name: telegramUser.first_name || null,
          last_name: telegramUser.last_name || null,
          username: telegramUser.username || null,
          photo_url: telegramUser.photo_url || null,
        },
        { onConflict: "telegram_id" }
      )
      .select()
      .single();

    if (dbError) {
      console.error("Error upserting user in Supabase:", dbError);
      return new Response(
        JSON.stringify({ verified: true, user: telegramUser, db_sync_warning: dbError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        verified: true,
        user: dbUser,
        telegram_raw: telegramUser,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("verify-telegram-init error:", err);
    return new Response(
      JSON.stringify({ error: "Internal verification error", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
