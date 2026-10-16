create table games (
    id         bigint generated always as identity primary key,
    title      text        not null,
    created_at timestamptz not null default now()
);
