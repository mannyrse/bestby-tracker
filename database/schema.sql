create table products (
  barcode text primary key,
  name text not null,
  image_url text not null default ''
);

create table items (
  id bigint primary key generated always as identity,
  name text not null,
  best_by date not null,
  barcode text,
  image_url text not null default '',
  status text not null default 'active'
    check (status in ('active', 'handled')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

alter table products enable row level security;
alter table items enable row level security;

create policy "signed in users products" on products
  for all to authenticated using (true) with check (true);
create policy "signed in users items" on items
  for all to authenticated using (true) with check (true);

revoke all on products, items from anon;
grant select, insert, update, delete on products, items to authenticated;