-- Migration: Add anchor-based positioning columns to comments
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/uxaceypbeimqbwvkcakm/sql

ALTER TABLE comments ADD COLUMN IF NOT EXISTS anchor_selector text;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS anchor_offset_x numeric DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS anchor_offset_y numeric DEFAULT 0;
