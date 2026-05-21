-- Expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  amount numeric not null,
  category text not null,
  date timestamptz not null default now(),
  note text default '',
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  due_date timestamptz,
  priority int default 0,
  is_completed boolean default false,
  completed_at timestamptz,
  is_archived boolean default false,
  created_at timestamptz default now()
);

-- Notes
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  content text default '',
  updated_at timestamptz default now()
);

-- Reminders
create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  scheduled_time timestamptz not null,
  repeat_mode text default 'none',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- User settings
create table user_settings (
  user_id uuid primary key references auth.users,
  currency_symbol text default '₹',
  budget_limit numeric default 0,
  gemini_api_key text default '',
  selected_model text default 'gemini-2.0-flash',
  theme text default 'light',
  onboarding_done boolean default false
);

-- RLS
alter table expenses enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table reminders enable row level security;
alter table user_settings enable row level security;

create policy "Users see own expenses" on expenses for all using (auth.uid() = user_id);
create policy "Users see own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users see own notes" on notes for all using (auth.uid() = user_id);
create policy "Users see own reminders" on reminders for all using (auth.uid() = user_id);
create policy "Users see own settings" on user_settings for all using (auth.uid() = user_id);

-- Indexes
create index idx_expenses_user_date on expenses(user_id, date desc);
create index idx_tasks_user on tasks(user_id, is_archived);
create index idx_notes_user on notes(user_id, updated_at desc);
create index idx_reminders_user on reminders(user_id, scheduled_time);
