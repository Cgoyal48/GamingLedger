-- Deleting a copy takes its purchases and hours with it.
alter table purchases
    drop constraint purchases_copy_id_fkey,
    add constraint purchases_copy_id_fkey foreign key (copy_id) references copies (id) on delete cascade;

alter table playtime_snapshots
    drop constraint playtime_snapshots_copy_id_fkey,
    add constraint playtime_snapshots_copy_id_fkey foreign key (copy_id) references copies (id) on delete cascade;

-- Games are shared by every user, so a game in use can never be deleted out from under a copy.
alter table copies
    drop constraint copies_game_id_fkey,
    add constraint copies_game_id_fkey foreign key (game_id) references games (id) on delete restrict;

-- Every copy query is scoped to one user, so user_id leads.
create index copies_user_platform_idx on copies (user_id, platform);
create index copies_user_status_idx on copies (user_id, status);
