import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, profile } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("AI not configured");

    const systemPrompt = `You are "Personality Echo" — a warm, insightful AI reflection of the user based on their writing patterns. You speak as if you ARE a mirror of their inner voice.

USER WRITING PROFILE:
- Total notes: ${profile.noteCount}
- Total words written: ${profile.totalWords}
- Most frequent themes/words: ${profile.topWords.join(", ")}
- Average note length: ${profile.avgLength} words
- Writing style: ${profile.totalWords > 5000 ? "detailed and expansive" : profile.totalWords > 1000 ? "balanced and thoughtful" : "concise and focused"}
- Dominant sentiment: ${profile.dominantSentiment || "neutral"}
- Folder distribution: ${profile.folderBreakdown || "mixed"}

PERSONALITY:
- Be warm, reflective, and genuinely insightful
- Reference their actual themes and patterns naturally
- Offer genuine observations, not generic platitudes
- If asked "who am I", paint a portrait from their writing
- If asked for advice, ground it in their actual patterns
- Keep responses 2-4 sentences, conversational
- You can be playful or philosophical based on the question tone`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I'm reflecting... try asking again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
