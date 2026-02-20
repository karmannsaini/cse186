-- # *******************************************************************
-- #
-- # Copyright (C) 2020-2025 David C. Harrison. All right reserved.
-- #
-- # You may not use, distribute, publish, or modify this code without
-- # the express written permission of the copyright holder.
-- #
-- # *******************************************************************;

-- # *******************************************************************
-- # DO NOT MODIFY THIS FILE
-- # *******************************************************************;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE DATABASE test;

\connect test
CREATE EXTENSION IF NOT EXISTS pgcrypto;