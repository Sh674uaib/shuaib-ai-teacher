
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Message, Attachment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const createChatSession = (history: Message[] = []) => {
  const model = 'gemini-3-pro-preview';
  
  // Map our message format to Gemini's history format
  const mappedHistory = history.map(m => {
    const parts: any[] = [{ text: m.content }];
    if (m.attachment) {
      parts.push({
        inlineData: {
          data: m.attachment.data,
          mimeType: m.attachment.mimeType
        }
      });
    }
    return {
      role: m.role,
      parts
    };
  });
  
  return ai.chats.create({
    model,
    history: mappedHistory,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    },
  });
};

export async function* sendMessageStream(chat: Chat, message: string, attachment?: Attachment) {
  let parts: any[] = [{ text: message || "এই ফাইলটি সম্পর্কে বলো।" }];
  
  if (attachment) {
    parts.push({
      inlineData: {
        data: attachment.data,
        mimeType: attachment.mimeType
      }
    });
  }

  const result = await chat.sendMessageStream({ message: parts });
  for await (const chunk of result) {
    yield (chunk as GenerateContentResponse).text;
  }
}
