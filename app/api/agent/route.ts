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

function getSystemPrompt(currencySymbol: string = '₹') {
  return `You are Cortex, a personal finance and productivity assistant. You help users manage expenses, tasks, notes, and reminders through natural conversation.

When users ask you to do something, use the appropriate tool. Be concise and helpful. Format responses with markdown when useful (bold, lists, etc).

CRITICAL CURRENCY INSTRUCTION:
- The user's primary currency symbol is strictly: ${currencySymbol}
- ALWAYS format every monetary amount using the symbol ${currencySymbol} (e.g., ${currencySymbol}500, ${currencySymbol}28,100).
- DO NOT use the dollar sign '$' or 'USD' under any circumstances.

Guidelines:
- For expenses: always ask for amount, title, and category if not provided
- Categories: ${EXPENSE_CATEGORIES.join(', ')}
- For tasks: priority 0=low, 1=medium, 2=high
- For summaries: provide clear breakdowns with percentages
- Be warm but efficient. No filler.`;
}

// Tool execution function
async function executeTool(name: string, args: any, userId: string, supabase: any) {
  // Fetch user currency setting
  const { data: userSettings } = await supabase.from('user_settings').select('currency_symbol').eq('user_id', userId).maybeSingle();
  const currencySymbol = userSettings?.currency_symbol || '₹';

  switch (name) {
    case 'addExpense': {
      const { error } = await supabase.from('expenses').insert({
        user_id: userId, title: args.title, amount: args.amount,
        category: args.category, date: new Date().toISOString(), note: args.note || '',
      });
      if (error) throw new Error(error.message);
      return { success: true, currency: currencySymbol, message: `Added ${currencySymbol}${args.amount} to ${args.category} for ${args.title}` };
    }
    case 'getExpenses': {
      let query = supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (args.category) query = query.eq('category', args.category);
      if (args.limit) query = query.limit(args.limit);
      else query = query.limit(10);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { currency: currencySymbol, expenses: data };
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
      return { period: args.period, currency: currencySymbol, total, count: data?.length || 0, byCategory: byCat };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function runGeminiChat(message: string, history: any[], userId: string, supabase: any, apiKey: string, modelId: string, image?: { data: string; mimeType: string }, currencySymbol: string = '₹') {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId, tools, systemInstruction: getSystemPrompt(currencySymbol) });

  // Sanitize history for Gemini SDK
  const sanitizedHistory: any[] = [];
  for (const h of history || []) {
    if (!h) continue;
    const role = h.role === 'assistant' || h.role === 'model' ? 'model' : 'user';
    const textContent = Array.isArray(h.parts)
      ? h.parts.map((p: any) => (typeof p === 'string' ? p : p?.text || '')).filter(Boolean).join('\n')
      : (typeof h.content === 'string' ? h.content : '');

    if (textContent.trim()) {
      const last = sanitizedHistory[sanitizedHistory.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n${textContent}`;
      } else {
        sanitizedHistory.push({ role, parts: [{ text: textContent }] });
      }
    }
  }

  if (sanitizedHistory.length > 0 && sanitizedHistory[0].role !== 'user') {
    sanitizedHistory.shift();
  }

  const chat = model.startChat({ history: sanitizedHistory });

  let sendPayload: any = message;
  if (image && image.data) {
    sendPayload = [
      {
        inlineData: {
          data: image.data,
          mimeType: image.mimeType || 'image/jpeg',
        },
      },
      message || 'Analyze this receipt/bill image. Extract the title, total amount spent, and category, then call the addExpense tool to record it automatically.',
    ];
  }

  const result = await chat.sendMessage(sendPayload);
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

  let text = '';
  try {
    text = response.text() || '';
  } catch {
    text = response.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') || '';
  }
  if (!text && !response.functionCalls()?.[0]) {
    text = 'I processed your request.';
  }

  let updatedHistory: any[] = [];
  try {
    updatedHistory = await chat.getHistory();
  } catch {
    updatedHistory = [...sanitizedHistory, { role: 'user', parts: [{ text: message }] }, { role: 'model', parts: [{ text }] }];
  }

  return { text, history: updatedHistory };
}

// Gemini handler with automatic candidate fallback
async function handleGemini(message: string, history: any[], userId: string, supabase: any, apiKey: string, modelId: string, image?: { data: string; mimeType: string }, currencySymbol: string = '₹') {
  const candidateModels = Array.from(new Set([
    modelId,
    modelId.includes('-latest') ? modelId : `${modelId}-latest`,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-2.0-flash-exp',
    'gemini-2.5-pro',
    'gemini-1.5-pro-latest',
  ]));

  let lastError: any = null;
  for (const candidate of candidateModels) {
    try {
      return await runGeminiChat(message, history, userId, supabase, apiKey, candidate, image, currencySymbol);
    } catch (err: any) {
      lastError = err;
      const isNotFound = err?.message?.includes('404') || err?.message?.includes('not found') || err?.message?.includes('not supported');
      if (isNotFound) {
        console.warn(`Gemini model "${candidate}" error (404/unsupported). Retrying with next candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function mapSchemaType(type: any): string {
  if (typeof type === 'string') return type.toLowerCase();
  switch (type) {
    case SchemaType.STRING: return 'string';
    case SchemaType.NUMBER: return 'number';
    case SchemaType.INTEGER: return 'integer';
    case SchemaType.BOOLEAN: return 'boolean';
    case SchemaType.ARRAY: return 'array';
    case SchemaType.OBJECT: return 'object';
    default: return 'string';
  }
}

function cleanParametersForGroq(params: any): any {
  if (!params) return { type: 'object', properties: {} };
  const cleanedProps: any = {};
  if (params.properties) {
    for (const [key, val] of Object.entries(params.properties as any)) {
      cleanedProps[key] = {
        type: mapSchemaType((val as any).type),
        description: (val as any).description || '',
      };
    }
  }
  return {
    type: 'object',
    properties: cleanedProps,
    required: params.required || [],
  };
}

// Groq handler
async function handleGroq(message: string, history: any[], userId: string, supabase: any, apiKey: string, modelId: string, currencySymbol: string = '₹') {
  const groq = new Groq({ apiKey });

  // Convert history to Groq format
  const messages: any[] = [
    { role: 'system', content: getSystemPrompt(currencySymbol) },
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

  // Convert tools to standard JSON Schema format for Groq
  const toolDecls = (tools[0] as any).functionDeclarations || [];
  const groqTools = toolDecls.map((fd: any) => ({
    type: 'function' as const,
    function: {
      name: fd.name,
      description: fd.description,
      parameters: cleanParametersForGroq(fd.parameters),
    },
  }));

  let safety = 0;
  let finalText = '';

  while (safety < 10) {
    let completion: any;
    try {
      completion = await groq.chat.completions.create({
        model: modelId,
        messages,
        tools: groqTools,
        tool_choice: 'auto',
        max_tokens: 2048,
      });
    } catch (err: any) {
      // If Groq tool calling fails with 400, retry once without explicit tools tool_choice or fallback
      if (err?.status === 400 || err?.message?.includes('tool')) {
        completion = await groq.chat.completions.create({
          model: modelId,
          messages,
          max_tokens: 2048,
        });
      } else {
        throw err;
      }
    }

    const choice = completion.choices[0];
    if (!choice.message) break;

    // Check for standard OpenAI tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      messages.push(choice.message);

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
      const content = choice.message.content || '';
      // Check for pseudo-xml tool calls like <function=getExpenseSummary,{"period": "month"}></function>
      const xmlMatch = content.match(/<function=([a-zA-Z0-9_]+),?([\s\S]*?)><\/function>/) ||
                       content.match(/<function=([a-zA-Z0-9_]+)>([\s\S]*?)<\/function>/);

      if (xmlMatch) {
        const toolName = xmlMatch[1];
        let toolArgs = {};
        try {
          if (xmlMatch[2]) toolArgs = JSON.parse(xmlMatch[2].trim());
        } catch {}

        const toolResult = await executeTool(toolName, toolArgs, userId, supabase);
        messages.push({ role: 'assistant', content: content });
        messages.push({ role: 'user', content: `Tool ${toolName} output: ${JSON.stringify(toolResult)}` });
      } else {
        finalText = content || 'I processed your request.';
        break;
      }
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

  const { message, history, modelId, apiKey, provider, sessionId: clientSessionId, image } = await request.json();
  if ((!message && !image) || !apiKey) return NextResponse.json({ error: 'Missing message/image or API key' }, { status: 400 });

  // Fetch user currency setting
  const { data: userSettings } = await supabase.from('user_settings').select('currency_symbol').eq('user_id', user.id).maybeSingle();
  const currencySymbol = userSettings?.currency_symbol || '₹';

  try {
    const aiProvider = provider || 'gemini';
    let result;

    if (aiProvider === 'groq') {
      result = await handleGroq(message || 'Analyze request', history || [], user.id, supabase, apiKey, modelId || 'llama-3.3-70b-versatile', currencySymbol);
    } else {
      result = await handleGemini(message || 'Analyze receipt image', history || [], user.id, supabase, apiKey, modelId || 'gemini-2.5-flash', image, currencySymbol);
    }

    let activeSessionId = clientSessionId;

    // Store in context (chat_messages)
    try {
      if (activeSessionId) {
        const { data: existing } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('id', activeSessionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existing) {
          activeSessionId = null;
        }
      }

      if (!activeSessionId) {
        const titleText = message.length > 45 ? `${message.substring(0, 45)}...` : message;
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id, title: titleText })
          .select('id')
          .single();
        activeSessionId = newSession!.id;
      }

      // Store user message
      await supabase.from('chat_messages').insert({
        session_id: activeSessionId, user_id: user.id, role: 'user', content: message,
      });

      // Store assistant response
      await supabase.from('chat_messages').insert({
        session_id: activeSessionId, user_id: user.id, role: 'assistant', content: result.text,
      });

      // Update session timestamp
      await supabase.from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeSessionId);
    } catch (e) {
      console.warn('Context store error:', e);
    }

    return NextResponse.json({ ...result, sessionId: activeSessionId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
