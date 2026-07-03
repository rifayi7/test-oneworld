-- Migration 0005_prices: Add mrp_price and offer_price to services
ALTER TABLE services ADD COLUMN mrp_price TEXT;
ALTER TABLE services ADD COLUMN offer_price TEXT;

-- Backfill offer_price with the existing price values
UPDATE services SET offer_price = price;
