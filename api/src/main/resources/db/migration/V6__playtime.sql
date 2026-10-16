create table playtime_snapshots (
    id          bigint generated always as identity primary key,
    copy_id     bigint      not null references copies (id),
    minutes     integer     not null,
    source      text        not null default 'manual',
    recorded_at timestamptz not null default now(),
    constraint playtime_minutes_check check (minutes >= 0),
    constraint playtime_source_check check (source in ('manual', 'steam'))
);

create index playtime_snapshots_copy_idx
    on playtime_snapshots (copy_id, recorded_at desc);
