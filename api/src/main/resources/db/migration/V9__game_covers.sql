-- IGDB's image id, e.g. "co1tmu". The URL is built from it, so only IGDB games ever have one.
alter table games add column cover_image_id text;

alter table games add constraint games_cover_igdb_only_check
    check (cover_image_id is null or source = 'igdb');
