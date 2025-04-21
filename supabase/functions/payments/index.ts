import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_ANON_KEY") ||
    "",
);

// Chapa configuration
const CHAPA_SECRET_KEY = Deno.env.get("CHAPA_SECRET_KEY") ||
  "";
const CHAPA_API_URL = "https://api.chapa.co/v1/transaction/initialize";

interface PaymentRequest {
  amount: number;
  currency: string;
  user_id: string;
  type: "event" | "service";
  item_id: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Parse and validate request body
    const body: PaymentRequest = await req.json();
    const { amount, currency, user_id, type, item_id } = body;

    if (!amount || !currency || !user_id || !type || !item_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!["event", "service"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type: must be 'event' or 'service'" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Generate unique transaction reference
    const chapa_tx_ref = `tx-${crypto.randomUUID()}`;

    // Log pending payment in Supabase
    // const { error: paymentError } = await supabase.from("payments").insert({
    //   user_id,
    //   amount,
    //   currency,
    //   status: "pending",
    //   chapa_tx_ref,
    //   ...(type === "event" ? { event_id: item_id } : { service_id: item_id }),
    // });

    // if (paymentError) {
    //   return new Response(
    //     JSON.stringify({
    //       error: "Failed to log payment",
    //       paymentError: paymentError,
    //     }),
    //     { status: 400, headers: { "Content-Type": "application/json" } },
    //   );
    // }

    // Fetch user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user_id)
      .single();

    if (!profile) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Prepare Chapa payment body
    const chapaBody = {
      amount,
      currency,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      tx_ref: chapa_tx_ref,
      return_url: `https://google.com/payment-complete?tx_ref=${chapa_tx_ref}`,
      "customization[title]": "Payment for my favourite merchant",
      "customization[description]": "I love online payments",
    };

    // Initiate Chapa payment
    const chapaRes = await fetch(CHAPA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chapaBody),
    });

    const chapaData = await chapaRes.json();

    if (chapaData.status !== "success" || !chapaData.data?.checkout_url) {
      console.error("Chapa error:", chapaData);
      return new Response(
        JSON.stringify({ error: "Failed to initiate payment", chapaData }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Return payment URL
    return new Response(
      JSON.stringify({
        chapa_tx_ref,
        redirectUrl: chapaData.data.checkout_url,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
