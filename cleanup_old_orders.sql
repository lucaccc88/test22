-- Drop the old 'orders' table as it has been replaced by 'user_balances' (single value)
-- and 'hacoo_orders' (automated list).
drop table if exists orders;
