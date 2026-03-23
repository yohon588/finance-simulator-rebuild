create extension if not exists "pgcrypto";

create table if not exists classrooms (
  id uuid primary key default gen_random_uuid(),
  code varchar(32) not null unique,
  name varchar(120) not null,
  teacher_name varchar(120) not null,
  status varchar(24) not null default 'draft',
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists room_seasons (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  round_no int not null,
  status varchar(24) not null,
  event_id int,
  cost_index numeric(10,4) not null default 1.0,
  random_seed varchar(80) not null,
  module_flags jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  role varchar(24) not null,
  display_name varchar(120) not null,
  role_id varchar(24),
  base_salary numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists student_states (
  user_id uuid primary key references users(id) on delete cascade,
  cash numeric(12,2) not null default 0,
  lq int not null default 0,
  boosts int not null default 0,
  arrears numeric(12,2) not null default 0,
  late_count int not null default 0,
  defaults_count int not null default 0,
  start_worth numeric(12,2) not null default 0,
  insurance_flags jsonb not null default '{}'::jsonb,
  module_flags jsonb not null default '{}'::jsonb
);

create table if not exists student_assets (
  user_id uuid not null references users(id) on delete cascade,
  asset_id varchar(24) not null,
  amount numeric(12,2) not null default 0,
  primary key (user_id, asset_id)
);

create table if not exists student_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  debt_type varchar(24) not null,
  creditor varchar(120) not null,
  principal numeric(12,2) not null default 0,
  rate_monthly numeric(8,4) not null default 0,
  min_pay numeric(12,2) not null default 0,
  missed_rounds int not null default 0,
  status varchar(24) not null default 'OK',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists round_decisions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references room_seasons(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  idempotency_key varchar(80) not null,
  payload_json jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (season_id, user_id, idempotency_key)
);

create table if not exists round_random_events (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references room_seasons(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  dice_roll int not null,
  category varchar(24) not null,
  card_id varchar(24) not null,
  base_effect_json jsonb not null,
  applied_effect_json jsonb not null,
  knowledge_point text not null,
  teacher_note text,
  created_at timestamptz not null default now(),
  unique (season_id, user_id)
);

create table if not exists round_ledgers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references room_seasons(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  payload_json jsonb not null,
  replay_hash varchar(120) not null,
  created_at timestamptz not null default now()
);

create table if not exists room_archives (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  export_version varchar(32) not null,
  payload_json jsonb not null,
  archived_at timestamptz not null default now()
);

create table if not exists classroom_runtime_snapshots (
  classroom_id uuid primary key references classrooms(id) on delete cascade,
  payload_json jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists auth_sessions (
  token varchar(120) primary key,
  role varchar(24) not null,
  user_id uuid not null,
  classroom_id uuid not null references classrooms(id) on delete cascade,
  payload_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
