import { GeminiModel } from './types';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Groceries',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: 'UtensilsCrossed',
  Transport: 'Car',
  Shopping: 'ShoppingBag',
  Bills: 'Receipt',
  Entertainment: 'Film',
  Health: 'Heart',
  Education: 'GraduationCap',
  Travel: 'Plane',
  Groceries: 'ShoppingCart',
  Other: 'MoreHorizontal',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#EF4444',
  Transport: '#3B82F6',
  Shopping: '#8B5CF6',
  Bills: '#F59E0B',
  Entertainment: '#EC4899',
  Health: '#10B981',
  Education: '#06B6D4',
  Travel: '#14B8A6',
  Groceries: '#F97316',
  Other: '#64748B',
};

export const CHART_COLORS = [
  '#6366F1',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#64748B',
];

export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Fast, balanced performance',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Latest fast model with thinking',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Most capable, complex reasoning',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    description: 'Lightweight, fastest responses',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Previous gen, reliable',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Previous gen, most capable',
  },
];

export const DEFAULT_MODEL_ID = 'gemini-2.0-flash';

export const CURRENCIES = ['₹', '$', '€', '£', '¥', '₩', '₽', '₺', 'R$', 'A$'];

export const SYSTEM_PROMPT = `You are Cortex, a personal finance and productivity assistant.
You help users manage expenses, tasks, notes, and reminders.

When users ask to:
- Add an expense: use addExpense tool
- View expenses: use getExpenses tool
- Add a task: use addTask tool
- View tasks: use getTasks tool
- Add a note: use addNote tool
- View notes: use getNotes tool
- Add a reminder: use addReminder tool
- View spending summary: use getExpenseSummary tool

Be concise and helpful. Use the local currency symbol provided.
If the user's intent is unclear, ask for clarification.`;

export const ARCHIVE_DAYS = 30;
