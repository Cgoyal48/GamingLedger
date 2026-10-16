drop table games cascade;

create table games (
    id         bigint generated always as identity primary key,
    title      text        not null,
    created_at timestamptz not null default now(),
    igdb_id    bigint,
    source     text        not null default 'custom',
    constraint games_source_check check (
        (source = 'custom' and igdb_id is null)
        or (source = 'igdb' and igdb_id is not null)
    )
);

create unique index games_igdb_id_idx
    on games (igdb_id)
    where igdb_id is not null;

create table copies (
    id          bigint generated always as identity primary key,
    user_id     uuid        not null,
    game_id     bigint      not null references games (id),
    platform    text        not null,
    status      text        not null,
    intent      text        not null,
    acquisition text        not null,
    created_at  timestamptz not null default now(),
    constraint copies_platform_check check (platform in ('steam', 'playstation', 'xbox', 'switch', 'pc', 'other')),
    constraint copies_status_check check (status in ('unplayed', 'playing', 'completed', 'abandoned')),
    constraint copies_intent_check check (intent in ('to_play', 'to_own')),
    constraint copies_acquisition_check check (acquisition in ('purchased', 'free', 'gift', 'subscription'))
);

create index copies_user_id_idx on copies (user_id);

create unique index copies_user_game_platform_idx
    on copies (user_id, game_id, platform);