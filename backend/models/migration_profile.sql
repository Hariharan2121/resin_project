-- RKL Trove — Profile System Migration
-- Run this against your MySQL database to enable profile features.

ALTER TABLE users
  ADD COLUMN phone VARCHAR(15) DEFAULT NULL,
  ADD COLUMN address TEXT DEFAULT NULL,
  ADD COLUMN pincode VARCHAR(10) DEFAULT NULL;
