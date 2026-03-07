-- Schema for assignment 8
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  profile JSONB NOT NULL,
  credentials JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id),
  content JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id INTEGER NOT NULL REFERENCES users(id),
  info JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
  user_id INTEGER NOT NULL REFERENCES users(id),
  group_id UUID NOT NULL REFERENCES groups(id),
  PRIMARY KEY (user_id, group_id)
);


