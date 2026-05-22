export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  due_date: string | null;
  priority: number; // 0=low, 1=medium, 2=high
  is_completed: boolean;
  completed_at: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  scheduled_time: string;
  repeat_mode: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  currency_symbol: string;
  budget_limit: number;
  gemini_api_key: string;
  groq_api_key: string;
  selected_model: string;
  ai_provider: string;
  theme: string;
  onboarding_done: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'gemini' | 'groq';
}

// Legacy alias
export type GeminiModel = AIModel;

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatContext {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_used: string | null;
  created_at: string;
}
