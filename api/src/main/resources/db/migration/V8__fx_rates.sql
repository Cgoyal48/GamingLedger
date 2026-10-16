create table fx_rates (
    rate_date date           not null,
    currency  text           not null,
    per_eur   numeric(20, 8) not null,
    primary key (rate_date, currency),
    constraint fx_rates_currency_check check (currency ~ '^[A-Z]{3}$'),
    constraint fx_rates_positive_check check (per_eur > 0)
);

create table user_settings (
    user_id          uuid primary key,
    display_currency text not null default 'INR',
    constraint user_settings_currency_check check (display_currency ~ '^[A-Z]{3}$')
);
