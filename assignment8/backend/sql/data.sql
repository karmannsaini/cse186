TRUNCATE group_members, posts, groups, users RESTART IDENTITY CASCADE;

INSERT INTO users (profile, password_hash) VALUES
  (
    '{
      "email": "molly@books.com",
      "displayName": "Molly Member",
      "roles": ["member"]
    }',
    crypt('mollymember', gen_salt('bf'))
  ),
  (
    '{
      "email": "anna@books.com",
      "displayName": "Anna Admin",
      "roles": ["admin"]
    }',
    crypt('annaadmin', gen_salt('bf'))
  );

INSERT INTO groups (owner_id, info) VALUES
  (
    1,
    '{
      "name": "Books Club",
      "description": "Discuss your favorite books"
    }'
  ),
  (
    2,
    '{
      "name": "Cooking Circle",
      "description": "Share recipes and tips"
    }'
  ),
  (
    1,
    '{
      "name": "Travel Buddies",
      "description": "Stories from the road"
    }'
  ),
  (
    2,
    '{
      "name": "Admins Only",
      "description": "Administrative announcements"
    }'
  );

INSERT INTO group_members (user_id, group_id) VALUES
  (1, 1),
  (2, 1),
  (1, 2),
  (2, 2),
  (1, 3),
  (2, 3),
  (2, 4)
ON CONFLICT DO NOTHING;

INSERT INTO posts (author_id, content) VALUES
  (
    1,
    '{
      "text": "Molly first post",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 1
    }'
  ),
  (
    2,
    '{
      "text": "Anna admin update",
      "createdAt": "2025-01-02T12:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 2
    }'
  ),
  (
    1,
    '{
      "text": "Another Molly post",
      "createdAt": "2025-01-03T09:30:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 3
    }'
  ),
  (
    1,
    '{
      "text": "Books club recommendation",
      "createdAt": "2025-01-04T08:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 1
    }'
  ),
  (
    2,
    '{
      "text": "Another book I love",
      "createdAt": "2025-01-05T09:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 1
    }'
  ),
  (
    1,
    '{
      "text": "Just finished a great novel",
      "createdAt": "2025-01-06T10:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 1
    }'
  ),
  (
    2,
    '{
      "text": "Trying a new pasta recipe",
      "createdAt": "2025-01-04T12:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 2
    }'
  ),
  (
    1,
    '{
      "text": "Baking bread today",
      "createdAt": "2025-01-05T13:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 2
    }'
  ),
  (
    2,
    '{
      "text": "Spicy curry night",
      "createdAt": "2025-01-06T14:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 2
    }'
  ),
  (
    1,
    '{
      "text": "Planning a trip to Japan",
      "createdAt": "2025-01-04T16:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 3
    }'
  ),
  (
    2,
    '{
      "text": "Memories from Italy",
      "createdAt": "2025-01-05T17:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 3
    }'
  ),
  (
    1,
    '{
      "text": "Best hiking trails",
      "createdAt": "2025-01-06T18:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 3
    }'
  ),
  (
    2,
    '{
      "text": "Admin notice for staff",
      "createdAt": "2025-01-07T09:00:00.000Z",
      "visibility": "PUBLIC",
      "groupId": 4
    }'
  );


