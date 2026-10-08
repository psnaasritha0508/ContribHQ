import { GoogleGenAI } from "@google/genai";
import { SubField, Difficulty } from "@prisma/client";

export interface EnrichedIssueAI {
  techStack: string[];
  subField: SubField;
  difficulty: Difficulty;
  aiSummary: string;
  aiActionPlan: string[];
}

const VALID_SUBFIELDS: SubField[] = [
  SubField.FRONTEND_UI,
  SubField.BACKEND_API,
  SubField.DATABASE,
  SubField.DOCS,
  SubField.DEVOPS_CONFIG,
  SubField.TESTING,
];

const VALID_DIFFICULTIES: Difficulty[] = [
  Difficulty.BEGINNER,
  Difficulty.INTERMEDIATE,
];

export const DEFAULT_AI_ENRICHMENT: EnrichedIssueAI = {
  techStack: ["TypeScript", "JavaScript"],
  subField: SubField.FRONTEND_UI,
  difficulty: Difficulty.BEGINNER,
  aiSummary:
    "This issue outlines a contribution opportunity for improving codebase functionality and ergonomics. Following standard testing and documentation practices is recommended for submission.",
  aiActionPlan: [
    "Clone the repository and set up the local development environment.",
    "Investigate the reported behavior and implement the required bugfix or feature.",
    "Add automated tests covering the changes and submit a concise pull request.",
  ],
};

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[GeminiService] GEMINI_API_KEY not found in environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export async function enrichIssueWithAI(
  title: string,
  body: string | null
): Promise<EnrichedIssueAI> {
  const ai = getGeminiClient();
  if (!ai) {
    return DEFAULT_AI_ENRICHMENT;
  }

  const prompt = `Analyze this open-source GitHub issue and classify it for developer onboarding.
Issue Title: ${title}
Issue Body: ${body ? body.slice(0, 2000) : "No description provided."}

Return a valid JSON object matching the requested schema.
- techStack: Array of primary programming languages and frameworks involved.
- subField: Must be exactly one of: ["FRONTEND_UI", "BACKEND_API", "DATABASE", "DOCS", "DEVOPS_CONFIG", "TESTING"].
- difficulty: Must be exactly one of: ["BEGINNER", "INTERMEDIATE"].
- aiSummary: Exactly 2 concise sentences describing what the issue is about and why it matters.
- aiActionPlan: Exactly 3 clear, actionable step-by-step pointers explaining how a contributor should solve it.`;

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              techStack: {
                type: "ARRAY" as any,
                items: { type: "STRING" as any },
                description: "Array of tech stack keywords",
              },
              subField: {
                type: "STRING" as any,
                enum: [
                  "FRONTEND_UI",
                  "BACKEND_API",
                  "DATABASE",
                  "DOCS",
                  "DEVOPS_CONFIG",
                  "TESTING",
                ],
              },
              difficulty: {
                type: "STRING" as any,
                enum: ["BEGINNER", "INTERMEDIATE"],
              },
              aiSummary: {
                type: "STRING" as any,
                description: "Exactly two concise sentences summarizing the issue",
              },
              aiActionPlan: {
                type: "ARRAY" as any,
                items: { type: "STRING" as any },
                description: "Array of exactly 3 actionable guidance steps",
              },
            },
            required: [
              "techStack",
              "subField",
              "difficulty",
              "aiSummary",
              "aiActionPlan",
            ],
          },
        },
      });
    } catch (modelErr: any) {
      if (modelErr?.status === 404 || String(modelErr).includes("gemini-2.5-flash")) {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT" as any,
              properties: {
                techStack: {
                  type: "ARRAY" as any,
                  items: { type: "STRING" as any },
                  description: "Array of tech stack keywords",
                },
                subField: {
                  type: "STRING" as any,
                  enum: [
                    "FRONTEND_UI",
                    "BACKEND_API",
                    "DATABASE",
                    "DOCS",
                    "DEVOPS_CONFIG",
                    "TESTING",
                  ],
                },
                difficulty: {
                  type: "STRING" as any,
                  enum: ["BEGINNER", "INTERMEDIATE"],
                },
                aiSummary: {
                  type: "STRING" as any,
                  description: "Exactly two concise sentences summarizing the issue",
                },
                aiActionPlan: {
                  type: "ARRAY" as any,
                  items: { type: "STRING" as any },
                  description: "Array of exactly 3 actionable guidance steps",
                },
              },
              required: [
                "techStack",
                "subField",
                "difficulty",
                "aiSummary",
                "aiActionPlan",
              ],
            },
          },
        });
      } else {
        throw modelErr;
      }
    }

    const text = response.text?.trim();
    if (!text) {
      console.warn("[GeminiService] Empty response text from Gemini. Using fallback.");
      return DEFAULT_AI_ENRICHMENT;
    }

    const parsed = JSON.parse(text);

    const subField = VALID_SUBFIELDS.includes(parsed.subField)
      ? (parsed.subField as SubField)
      : SubField.FRONTEND_UI;

    const difficulty = VALID_DIFFICULTIES.includes(parsed.difficulty)
      ? (parsed.difficulty as Difficulty)
      : Difficulty.BEGINNER;

    const techStack =
      Array.isArray(parsed.techStack) && parsed.techStack.length > 0
        ? parsed.techStack.map(String)
        : ["General"];

    const aiSummary =
      typeof parsed.aiSummary === "string" && parsed.aiSummary.trim().length > 0
        ? parsed.aiSummary.trim()
        : DEFAULT_AI_ENRICHMENT.aiSummary;

    let aiActionPlan: string[] = [];
    if (Array.isArray(parsed.aiActionPlan) && parsed.aiActionPlan.length >= 3) {
      aiActionPlan = parsed.aiActionPlan.slice(0, 3).map(String);
    } else {
      aiActionPlan = DEFAULT_AI_ENRICHMENT.aiActionPlan;
    }

    return {
      techStack,
      subField,
      difficulty,
      aiSummary,
      aiActionPlan,
    };
  } catch (error) {
    console.error("[GeminiService] Error generating enrichment with Gemini. Falling back gracefully:", error);
    return DEFAULT_AI_ENRICHMENT;
  }
}
