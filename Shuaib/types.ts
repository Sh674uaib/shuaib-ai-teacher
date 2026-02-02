
export type Subject = 'General Math' | 'Higher Math' | 'Physics' | 'Chemistry' | 'Biology' | 'English Grammar' | 'General';

export interface Attachment {
  type: 'image' | 'audio';
  data: string; // base64 string
  mimeType: string;
  url: string; // object URL for UI display
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachment?: Attachment;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: Subject;
  messages: Message[];
  lastModified: Date;
}
