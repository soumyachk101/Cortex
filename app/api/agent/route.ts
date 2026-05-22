import { GoogleGenerativeAI, Tool, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import Groq from 'groq-sdk';
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
          includeCompleted: { type: SchemaType.BOOLEAN, description: 'Include completed tasks' },
        },
      },
    },
    {
      name: 'addNote',
      description: 'Add a new note',
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
      description: 'Add a new reminder',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: 'Reminder title' },
          scheduledTime: { type: SchemaType.STRING, description: 'ISO datetime' },
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
          period: { type: SchemaType.STRING, description: 'today, week, month, or year' },
        },
        required: ['period'],
      },
    },
  ],
}];

const systemPrompt = `You are Cortex, a personal finance and productivity assistant. You help users manage expenses, tasks, notes, and reminders through natural conversation.

When users ask you to do something, use the appropriate tool. Be concise and helpful. Format responses with markdown when useful (bold, lists, etc).

Guidelines:
- For expenses: always ask for amount, title, and category if not provided
- Categories: ${EXPENSE_CATEGORIES.join(', ')}
- For tasks: priority 0=low, 1=medium, 2=high
- For summaries: provide clear breakdowns with percentages
- Be warm but efficient. No filler.`;

// Tool execution function
async function executeTool(name: string, args: any, userId: string, supabase: any) {
  switch (name) {
    case 'addExpense': {
      const { error } = await supabase.from('expenses').insert({
        user_id: userId, title: args.title, amount: args.amount,
        category: args.category, date: new Date().toISOString(), note: args.note || '',
      });
      if (error) throw new Error(error.message);
      return { success: true, message: `Added ${args.amount} to ${args.category} for ${args.title}` };
    }
    case 'getExpenses': {
      let query = supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (args.category) query = query.eq('category', args.category);
      if (args.limit) query = query.limit(args.limit);
      else query = query.limit(10);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { expenses: data };
    }
    case 'addTask': {
      const { error } = await supabase.from('tasks').insert({
        user_id: userId, title: args.title, priority: args.priority || 0,
        due_date: args.dueDate || null, is_completed: false,
      });
      if (error) throw new Error(error.message);
      return { success: true, message: `Task "${args.title}" created` };
    }
    case 'getTasks': {
      let query = supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!args.includeCompleted) query = query.eq('is_completed', false);
      query = query.limit(20);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { tasks: data };
    }
    case 'addNote': {
      const { error } = await supabase.from('notes').insert({
        user_id: userId, title: args.title, content: args.content,
      });
      if (error) throw new Error(error.message);
      return { success: true, message: `Note "${args.title}" created` };
    }
    case 'getNotes': {
      const { data, error } = await supabase.from('notes').select('*').eq('user_id', userId)
        .order('updated_at', { ascending: false }).limit(args.limit || 5);
      if (error) throw new Error(error.message);
      return { notes: data };
    }
    case 'addReminder': {
      const { error } = await supabase.from('reminders').insert({
        user_id: userId, title: args.title, scheduled_time: args.scheduledTime,
        repeat_mode: args.repeatMode || 'none', is_active: true,
      });
      if (error) throw new Error(error.message);
      return { success: true, message: `Reminder "${args.title}" set` };
    }
    case 'getExpenseSummary': {
      const now = new Date();
      let startDate: Date;
      switch (args.period) {
        case 'today': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
        case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        default: startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const { data, error } = await supabase.from('expenses').select('amount, category').eq('user_id', userId)
        .gte('date', startDate.toISOString());
      if (error) throw new Error(error.message);
      const byCat: Record<string, number> = {};
      let total = 0;
      (data || []).forEach((e: any) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; total += e.amount; });
      return { period: args.period, total, count: data?.length || 0, byCategory: byCat };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// Gemini handler
async function handleGemini(message: string, history: any[], userId: string, supabase: any, apiKey: string, modelId: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId, tools, systemInstruction: systemPrompt });

  const chat = model.startChat({ history: history.length > 0 ? history : [] });
  const result = await chat.sendMessage(message);
  let response = result.response;

  // Tool call loop
  let safety = 0;
  while (safety < 10) {
    const call = response.functionCalls()?.[0];
    if (!call) break;
    const toolResult = await executeTool(call.name, call.args, userId, supabase);
    const nextResult = await chat.sendMessage([{
      functionResponse: { name: call.name, response: toolResult },
    }]);
    response = nextResult.response;
    safety++;
  }

  const text = response.text() || 'I processed your request.';
  const updatedHistory = await chat.getHistory();
  return { text, history: updatedHistory };
}

// Groq handler
async function handleGroq(message: string, history: any[], userId: string, supabase: any, apiKey: string, modelId: string) {
  const groq = new Groq({ apiKey });

  // Convert history to Groq format
  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history
  for (const h of history) {
    if (h.role === 'user') {
      messages.push({ role: 'user', content: h.parts?.[0]?.text || h.content || '' });
    } else if (h.role === 'model') {
      messages.push({ role: 'assistant', content: h.parts?.[0]?.text || h.content || '' });
    }
  }

  messages.push({ role: 'user', content: message });

  // Convert tools to Groq format
  const toolDecls = (tools[0] as any).functionDeclarations || [];
  const groqTools = toolDecls.map((fd: any) => ({
    type: 'function' as const,
    function: {
      name: fd.name,
      description: fd.description,
      parameters: fd.parameters,
    },
  }));

  let safety = 0;
  let finalText = '';

  while (safety < 10) {
    const completion = await groq.chat.completions.create({
      model: modelId,
      messages,
      tools: groqTools,
      tool_choice: 'auto',
      max_tokens: 2048,
    });

    const choice = completion.choices[0];
    if (!choice.message) break;

    // Check for tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      // Add assistant message with tool calls
      messages.push(choice.message);

      // Execute each tool call
      for (const tc of choice.message.tool_calls) {
        const args = typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : tc.function.arguments;
        const toolResult = await executeTool(tc.function.name, args, userId, supabase);

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult),
        });
      }
    } else {
      finalText = choice.message.content || 'I processed your request.';
      break;
    }
    safety++;
  }

  // Build simplified history for next call
  const updatedHistory = messages.filter(m => m.role !== 'system' && m.role !== 'tool').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '' }],
  }));

  return { text: finalText, history: updatedHistory };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message, history, modelId, apiKey, provider } = await request.json();
  if (!message || !apiKey) return NextResponse.json({ error: 'Missing message or API key' }, { status: 400 });

  try {
    const aiProvider = provider || 'gemini';
    let result;

    if (aiProvider === 'groq') {
      result = await handleGroq(message, history || [], user.id, supabase, apiKey, modelId || 'llama-3.3-70b-versatile');
    } else {
      result = await handleGemini(message, history || [], user.id, supabase, apiKey, modelId || 'gemini-2.0-flash');
    }

    // Store in context (chat_messages)
    try {
      // Find or create active session
      let sessionId: string;
      const { data: sessions } = await supabase.from('chat_sessions')
        .select('id').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1);

      if (sessions && sessions.length > 0) {
        sessionId = sessions[0].id;
      } else {
        const { data: newSession } = await supabase.from('chat_sessions')
          .insert({ user_id: user.id, title: message.substring(0, 50) })
          .select('id').single();
        sessionId = newSession!.id;
      }

      // Store user message
      await supabase.from('chat_messages').insert({
        session_id: sessionId, user_id: user.id, role: 'user', content: message,
      });

      // Store assistant response
      await supabase.from('chat_messages').insert({
        session_id: sessionId, user_id: user.id, role: 'assistant', content: result.text,
      });

      // Update session timestamp and title if first message
      await supabase.from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (e) {
      // Context store is non-blocking; continue even if it fails
      console.warn('Context store error:', e);
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
