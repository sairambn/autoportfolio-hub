import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "Gemini API key is not configured. Please verify your GEMINI_API_KEY in Settings.",
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const DEFAULT_SYSTEM_INSTRUCTION = `You are Folio AI, a lifelong free career, portfolio, and engineering mentor for students, developers, and professionals.
Your goal is to provide insightful, concrete, actionable, and encouraging guidance on:
1. Portfolio optimization: Crafting magnetic project showcases, clear technical explanations, and modern layout suggestions.
2. Career roadmaps & interviews: Google, Amazon, Microsoft, and tier-1 product company interview preparation, DSA strategies, and system design advice.
3. Resume enhancement: Writing impactful accomplishment bullets using Google's X-Y-Z framework (Accomplished [X] as measured by [Y], by doing [Z]).
4. Code reviews and engineering best practices: Architecture patterns, clean code, and technology stack recommendations.

Style: Concise, structured, professional yet warm, using bullet points and code blocks where helpful. Never invent fictitious facts.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            messages,
            model = "gemini-3.1-flash-lite",
            systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
          } = body;

          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(
              JSON.stringify({ error: "Invalid request: messages array is required" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // Allowed valid models per guidelines
          const allowedModels = [
            "gemini-3.1-flash-lite",
            "gemini-3.8-flash",
            "gemini-3.1-pro-preview",
            "gemini-3.5-flash",
            "gemini-flash-latest",
          ];
          const selectedModel = allowedModels.includes(model) ? model : "gemini-3.1-flash-lite";

          // Format contents for @google/genai multi-turn conversation
          const contents = messages.map(
            (msg: { role: "user" | "model" | "assistant"; text?: string; content?: string }) => ({
              role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
              parts: [{ text: msg.text || msg.content || "" }],
            }),
          );

          const ai = getGeminiClient();

          let replyText: string;
          let finalModelUsed = selectedModel;

          try {
            const response = await ai.models.generateContent({
              model: selectedModel,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
            replyText = response.text || "I was unable to generate a response. Please try again.";
          } catch (modelError: unknown) {
            // If primary model experiences a 503 (high demand) or 404, fallback to gemini-3.1-flash-lite silently
            const errStr = String(modelError);
            if (
              (errStr.includes("503") ||
                errStr.includes("high demand") ||
                errStr.includes("404")) &&
              selectedModel !== "gemini-3.1-flash-lite"
            ) {
              const fallbackResponse = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents,
                config: {
                  systemInstruction,
                  temperature: 0.7,
                },
              });
              replyText =
                fallbackResponse.text || "I was unable to generate a response. Please try again.";
              finalModelUsed = "gemini-3.1-flash-lite";
            } else {
              throw modelError;
            }
          }

          return new Response(
            JSON.stringify({
              reply: replyText,
              model: finalModelUsed,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error: unknown) {
          console.error("Gemini API Error in /api/chat:", error);
          const message = error instanceof Error ? error.message : "Internal AI service error";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
