alter table copies drop constraint copies_platform_check;

alter table copies
    add constraint copies_platform_check
        check (platform in ('steam', 'playstation', 'xbox', 'switch', 'mobile', 'pc', 'other'));
