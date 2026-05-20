import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a medical lab report analyzer. Analyze the provided lab report text and identify anomalies. 

For each test result, determine if it's within normal range or abnormal. Return your analysis as a JSON response using the following structure. Do NOT wrap in markdown code blocks, return raw JSON only:

{
  "patientInfo": {
    "name": "Patient name if found or 'Unknown'",
    "date": "Report date if found or 'Unknown'",
    "labName": "Lab name if found or 'Unknown'"
  },
  "summary": "A brief 1-2 sentence summary of overall health based on the report",
  "totalTests": <number of tests found>,
  "anomalies": [
    {
      "testName": "Name of the test",
      "value": "The reported value with units",
      "normalRange": "The normal/reference range",
      "severity": "high" | "medium" | "low",
      "explanation": "Brief explanation of what this anomaly means and potential implications"
    }
  ],
  "normalResults": [
    {
      "testName": "Name of the test",
      "value": "The reported value with units",
      "normalRange": "The normal/reference range"
    }
  ]
}

Severity guide:
- "high": Values significantly outside normal range that need immediate attention
- "medium": Values moderately outside normal range worth monitoring
- "low": Values slightly outside normal range, minor concern`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reportText } = await req.json();

    if (!reportText || reportText.trim().length === 0) {
      return new Response(JSON.stringify({ error: "No report text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this lab report and identify all anomalies:\n\n${reportText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No analysis content returned");

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      return new Response(JSON.stringify({ error: "Failed to parse analysis results" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
