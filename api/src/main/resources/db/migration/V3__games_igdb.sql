alter table games
    add column igdb_id bigint,
    add column source text not null default 'custom',
    add constraint games_source_check check (
        (source = 'custom' and igdb_id is null)
        or (source = 'igdb' and igdb_id is not null)
    );

create unique index games_user_igdb_idx
    on games (user_id, igdb_id)
    where igdb_id is not null;