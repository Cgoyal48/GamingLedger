-- A copy is bought once. Everything spent on it afterwards is an in-game purchase.
create unique index purchases_one_game_per_copy_idx
    on purchases (copy_id)
    where kind = 'game';
