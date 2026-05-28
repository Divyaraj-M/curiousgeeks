-- ============================================================
-- Curious Geeks — Neon Postgres Schema
-- Run with: npx neonctl@latest sql-from-file --file db/schema.sql \
--             --project-id mute-credit-65239892
-- Or paste into the Neon Console SQL Editor.
-- ============================================================

create extension if not exists "uuid-ossp";

-- Members
create table if not exists members (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

-- Products
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  url text,
  maker_name text,
  maker_email text,
  category text,
  tags text[],
  approved boolean default true,
  created_at timestamp with time zone default now()
);

-- Comments
create table if not exists comments (
  id uuid default uuid_generate_v4() primary key,
  product_slug text not null references products(slug) on delete cascade,
  author_name text not null,
  author_email text not null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- OTP codes for email sign-in
create table if not exists otps (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  code text not null,
  expires_at timestamp with time zone not null,
  used boolean default false,
  created_at timestamp with time zone default now()
);

-- Product stage field (added after initial schema)
alter table products add column if not exists stage text;

-- ── Indexes ───────────────────────────────────────────────
create index if not exists idx_products_slug    on products(slug);
create index if not exists idx_products_created on products(created_at desc);
create index if not exists idx_comments_product on comments(product_slug);
create index if not exists idx_members_email    on members(email);
create index if not exists idx_otps_email       on otps(email);

-- Product likes (added after initial schema)
create table if not exists product_likes (
  id           uuid default uuid_generate_v4() primary key,
  product_slug text not null references products(slug) on delete cascade,
  member_email text not null references members(email) on delete cascade,
  created_at   timestamp with time zone default now(),
  constraint product_likes_unique unique (product_slug, member_email)
);
create index if not exists idx_product_likes_slug  on product_likes(product_slug);
create index if not exists idx_product_likes_email on product_likes(member_email);

-- Review ratings on comments (added after initial schema)
alter table comments
  add column if not exists rating smallint check (rating >= 1 and rating <= 5);
