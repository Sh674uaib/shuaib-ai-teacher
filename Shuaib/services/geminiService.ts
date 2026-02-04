import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants";
// TypeScript এর জন্য import type ব্যবহার করা হয়েছে
import type { Message, Attachment } from "../types";

const API_KEY = "AIzaSyCPInx-UJGW85dh3zILv-8pICVgFob2ks8";
const genAI = new GoogleGenerativeAI(API_KEY);

export const createChatSession = (history: Message[] = []) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });

  const mappedHistory = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  return model.startChat({
    history: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "আমি Shuaib 2.0 AI শিক্ষক, তোমাকে সাহায্য করতে প্রস্তুত।" }] },
      ...mappedHistory,
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });
};

export async function* sendMessageStream(chat: any, message: string, attachment?: Attachment) {
  try {
    const parts: any[] = [];
    if (message.trim()) parts.push({ text: message });
    
    if (attachment) {
      parts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }

    if (parts.length === 0) parts.push({ text: "Hello" });

    const result = await chat.sendMessageStream(parts);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) yield chunkText;
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    yield "দুঃখিত, গুগল সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। দয়া করে আবার চেষ্টা করো।";
  }
}
