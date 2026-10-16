delete from games;

alter table games
    add column user_id uuid not null;

create index games_user_id_idx on games (user_id);