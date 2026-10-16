create table purchases (
    id           bigint generated always as identity primary key,
    user_id      uuid        not null,
    copy_id      bigint      references copies (id),
    kind         text        not null,
    amount_minor bigint      not null,
    currency     text        not null,
    purchased_at timestamptz not null,
    note         text,
    created_at   timestamptz not null default now(),
    constraint purchases_kind_check check (kind in ('game', 'in_game', 'top_up')),
    constraint purchases_copy_check check ((kind = 'top_up') = (copy_id is null)),
    constraint purchases_amount_check check (amount_minor > 0),
    constraint purchases_currency_check check (currency ~ '^[A-Z]{3}$')
);

create index purchases_user_id_idx on purchases (user_id);
create index purchases_copy_id_idx on purchases (copy_id);