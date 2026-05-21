import { GoogleGenerativeAI, Tool, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Travel', 'Groceries', 'Other'];

const tools: Tool[] = [{
  functionDeclarations: [
    {
      name: 'addExpense',
      description: 'Add a new expense entry',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: 'Expense title' },
          amount: { type: SchemaType.NUMBER, description: 'Amount spent' },
          category: { type: SchemaType.STRING, description: `Category: ${EXPENSE_CATEGORIES.join(', ')}` },
          note: { type: SchemaType.STRING, description: 'Optional note' },
        },
        required: ['title', 'amount', 'category'],
      },
    },
    {
      name: 'getExpenses',
      description: 'Get recent expenses',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          category: { type: SchemaType.STRING, description: 'Filter by category' },
          limit: { type: SchemaType.INTEGER, description: 'Max results' },
        },
      },
    },
    {
      name: 'addTask',
      description: 'Add a new task',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: 'Task title' },
          priority: { type: SchemaType.INTEGER, description: '0=low, 1=medium, 2=high' },
          dueDate: { type: SchemaType.STRING, description: 'Due date ISO format' },
        },
        required: ['title'],
      },
    },
    {
      name: 'getTasks',
      description: 'Get active tasks',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          includeCompleted: { type: SchemaType.BOOLEAN, description: 'Include completed' },
        },
      },
    },
    {
      name: 'addNote',
      description: 'Create a new note',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: 'Note title' },
          content: { type: SchemaType.STRING, description: 'Note content' },
        },
        required: ['title', 'content'],
      },
    },
    {
      name: 'getNotes',
      description: 'Get recent notes',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          limit: { type: SchemaType.INTEGER, description: 'Max results' },
        },
      },
    },
    {
      name: 'addReminder',
      description: 'Schedule a reminder',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: 'Reminder title' },
          scheduledTime: { type: SchemaType.STRING, description: 'ISO format' },
          repeatMode: { type: SchemaType.STRING, description: 'none, daily, weekly' },
        },
        required: ['title', 'scheduledTime'],
      },
    },
    {
      name: 'getExpenseSummary',
      description: 'Get spending summary',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          period: { type: SchemaType.STRING, description: 'today, week, month, year' },
        },
      },
    },
  ],
}];

const SYSTEM_PROMPT = `You are Cortex, a personal finance and productivity assistant.
You help users manage expenses, tasks, notes, and reminders.
Be concise and helpful. Use the local currency symbol provided.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history, modelId, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not set. Go to Settings.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelId || 'gemini-2.0-flash',
      tools,
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history: history || [] });
    let result = await chat.sendMessage(message);

    // Handle tool calls in a loop
    while (result.response.functionCalls()?.length) {
      const functionCalls = result.response.functionCalls()!;
      const responses = [];

      for (const call of functionCalls) {
        const fnResult = await executeFunction(call.name, call.args, supabase, user.id);
        responses.push({ functionResponse: { name: call.name, response: fnResult } });
      }

      result = await chat.sendMessage(responses);
    }

    const text = result.response.text();
    return NextResponse.json({ text, history: await chat.getHistory() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function executeFunction(name: string, args: any, supabase: any, userId: string) {
  const { data: settings } = await supabase.from('user_settings').select('currency_symbol').eq('user_id', userId).single();
  const currency = settings?.currency_symbol || '₹';

  switch (name) {
    case 'addExpense': {
      await supabase.from('expenses').insert({ title: args.title, amount: args.amount, category: args.category, note: args.note || '', user_id: userId });
      return { success: true, message: `${currency}${args.amount} added to ${args.category} for ${args.title}` };
    }
    case 'getExpenses': {
      let query = supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(args.limit || 10);
      if (args.category) query = query.eq('category', args.category);
      const { data } = await query;
      return { expenses: data, count: data?.length };
    }
    case 'addTask': {
      await supabase.from('tasks').insert({ title: args.title, priority: args.priority || 0, due_date: args.dueDate || null, user_id: userId });
      return { success: true, message: `Task "${args.title}" added` };
    }
    case 'getTasks': {
      let query = supabase.from('tasks').select('*').eq('user_id', userId).eq('is_archived', false);
      if (!args.includeCompleted) query = query.eq('is_completed', false);
      const { data } = await query;
      return { tasks: data, count: data?.length };
    }
    case 'addNote': {
      await supabase.from('notes').insert({ title: args.title, content: args.content, user_id: userId });
      return { success: true, message: `Note "${args.title}" created` };
    }
    case 'getNotes': {
      const { data } = await supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(args.limit || 10);
      return { notes: data, count: data?.length };
    }
    case 'addReminder': {
      await supabase.from('reminders').insert({ title: args.title, scheduled_time: args.scheduledTime, repeat_mode: args.repeatMode || 'none', user_id: userId });
      return { success: true, message: `Reminder "${args.title}" set` };
    }
    case 'getExpenseSummary': {
      const now = new Date();
      let start: Date;
      switch (args.period) {
        case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
        case 'week': start = new Date(now); start.setDate(start.getDate() - start.getDay()); break;
        case 'year': start = new Date(now.getFullYear(), 0, 1); break;
        default: start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const { data } = await supabase.from('expenses').select('*').eq('user_id', userId).gte('date', start.toISOString());
      const total = data?.reduce((s: number, e: any) => s + e.amount, 0) || 0;
      const byCategory: Record<string, number> = {};
      data?.forEach((e: any) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
      return { period: args.period, total, currency, transactionCount: data?.length, byCategory };
    }
    default:
      return { error: `Unknown function: ${name}` };
  }
}
