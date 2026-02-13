-- # *******************************************************************
-- #
-- # Copyright (C) 2020-2026 David C. Harrison. All right reserved.
-- #
-- # You may not use, distribute, publish, or modify this code without
-- # the express written permission of the copyright holder.
-- #
-- # *******************************************************************;

-- # *******************************************************************
-- # DO NOT MODIFY THIS FILE
-- # *******************************************************************;

DROP TABLE IF EXISTS mailbox CASCADE;
CREATE TABLE mailbox (
  id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), 
  data jsonb
);

DROP TABLE IF EXISTS mail;
CREATE TABLE mail (
  id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), 
  mailbox UUID REFERENCES mailbox(id), 
  data jsonb
);
