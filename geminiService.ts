
import { GoogleGenAI, Type } from "@google/genai";
import { Employee } from "../types";

// Always use the process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractAttendanceData(base64Data: string, mimeType: string): Promise<Employee[]> {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are an expert HR data analyst. Your task is to extract employee attendance data from monthly reports.
    Look for employee names and their Reasons of Absence (ROA).
    The valid ROA types are: AL (Annual Leave), EL (Emergency Leave), MC (Medical Certificate), ABS (Absent), and HP (Hospitalization).
    Ignore cells that are blank or white.
    Count how many times each ROA appears for each employee in that month.
    Return the data as a clean JSON array of employees.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract employee names and the counts of their ROAs (AL, EL, MC, ABS, HP). Only return valid JSON."
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              absences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Must be AL, EL, MC, ABS, or HP" },
                    count: { type: Type.NUMBER }
                  },
                  required: ["type", "count"]
                }
              }
            },
            required: ["name", "absences"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result.map((emp: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      ...emp
    }));
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
