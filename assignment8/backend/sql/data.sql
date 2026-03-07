TRUNCATE group_members, posts, groups, users RESTART IDENTITY CASCADE;

INSERT INTO users (profile, credentials) VALUES
  (
    '{"email": "molly@books.com", "displayName": "Molly Member", "roles": ["member"]}',
    json_build_object('password_hash', crypt('mollymember', gen_salt('bf')))
  ),
  (
    '{"email": "anna@books.com", "displayName": "Anna Admin", "roles": ["admin"]}',
    json_build_object('password_hash', crypt('annaadmin', gen_salt('bf')))
  ),
  (
    '{"email": "minimal@test.com"}',
    json_build_object('password_hash', crypt('minimal', gen_salt('bf')))
  );

INSERT INTO groups (id, owner_id, info) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid, 1, '{
      "name": "Books Club",
      "description": "Discuss your favorite books"
    }'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'::uuid, 2, '{
      "name": "Cooking Circle",
      "description": "Share recipes and tips"
    }'),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'::uuid, 1, '{
      "name": "Travel Buddies",
      "description": "Stories from the road"
    }'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a'::uuid, 2, '{
      "name": "Admins Only",
      "description": "Administrative announcements"
    }');

INSERT INTO group_members (user_id, group_id) VALUES
  (1, 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid),
  (2, 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid),
  (1, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'::uuid),
  (2, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'::uuid),
  (1, 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'::uuid),
  (2, 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'::uuid),
  (2, 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a'::uuid)
ON CONFLICT DO NOTHING;

INSERT INTO posts (author_id, content) VALUES
  (1, '{"text": "Molly first post", "createdAt": "2025-01-01T10:00:00.000Z", "visibility": "PUBLIC", "groupId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"}'),
  (2, '{"text": "Anna admin update", "createdAt": "2025-01-02T12:00:00.000Z", "visibility": "PUBLIC", "groupId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"}'),
  (1, '{"text": "Another Molly post", "createdAt": "2025-01-03T09:30:00.000Z", "visibility": "PUBLIC", "groupId": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"}'),
  (1, '{"text": "Books club recommendation", "createdAt": "2025-01-04T08:00:00.000Z", "visibility": "PUBLIC", "groupId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"}'),
  (2, '{"text": "Another book I love", "createdAt": "2025-01-05T09:00:00.000Z", "visibility": "PUBLIC", "groupId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"}'),
  (1, '{"text": "Just finished a great novel", "createdAt": "2025-01-06T10:00:00.000Z", "visibility": "PUBLIC", "groupId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"}'),
  (2, '{"text": "Trying a new pasta recipe", "createdAt": "2025-01-04T12:00:00.000Z", "visibility": "PUBLIC", "groupId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"}'),
  (1, '{"text": "Baking bread today", "createdAt": "2025-01-05T13:00:00.000Z", "visibility": "PUBLIC", "groupId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"}'),
  (2, '{"text": "Spicy curry night", "createdAt": "2025-01-06T14:00:00.000Z", "visibility": "PUBLIC", "groupId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"}'),
  (1, '{"text": "Planning a trip to Japan", "createdAt": "2025-01-04T16:00:00.000Z", "visibility": "PUBLIC", "groupId": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"}'),
  (2, '{"text": "Memories from Italy", "createdAt": "2025-01-05T17:00:00.000Z", "visibility": "PUBLIC", "groupId": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"}'),
  (1, '{"text": "Best hiking trails", "createdAt": "2025-01-06T18:00:00.000Z", "visibility": "PUBLIC", "groupId": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"}'),
  (2, '{"text": "Admin notice for staff", "createdAt": "2025-01-07T09:00:00.000Z", "visibility": "PUBLIC", "groupId": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a"}');


