/**
 * Map DB rows (id, author_id, content, profile?) to API post shape.
 * @param {Array<object>} rows DB rows (profile from joined users table)
 * @returns {Array<object>} post list (id, authorId, authorDisplayName, content)
 */
export function mapPostRows(rows) {
  return rows.map((row) => {
    const profile = row.profile || {};
    const authorDisplayName =
      profile.displayName || profile.email || 'Unknown';
    return {
      id: row.id,
      authorId: row.author_id,
      authorDisplayName,
      content: row.content,
    };
  });
}

/**
 * Load reaction counts and user reaction per post, return posts with reactions.
 * @param {(sql: string, params: Array<unknown>) =>
 *   Promise<{rows: object[]}>} queryFn db.query
 * @param {number} userId current user id
 * @param {Array<object>} posts list of posts (each has id)
 * @returns {Promise<Array<object>>} posts with reactions and userReaction
 */
export async function enrichPostsWithReactions(queryFn, userId, posts) {
  const ids = posts.map((p) => p.id);
  if (ids.length === 0) return posts;
  const countsResult = await queryFn(
      'SELECT post_id, type, COUNT(*) AS cnt ' +
      'FROM reactions WHERE post_id = ANY($1::int[]) GROUP BY post_id, type',
      [ids],
  );
  const countsByPost = {};
  for (const row of countsResult.rows) {
    const postId = row.post_id;
    const type = row.type;
    const cnt = Number(row.cnt);
    if (!countsByPost[postId]) countsByPost[postId] = {};
    countsByPost[postId][type] = cnt;
  }
  const userResult = await queryFn(
      'SELECT post_id, type FROM reactions ' +
      'WHERE user_id = $1 AND post_id = ANY($2::int[])',
      [userId, ids],
  );
  const userReactionByPost = {};
  for (const row of userResult.rows) {
    userReactionByPost[row.post_id] = row.type;
  }
  return posts.map((p) => {
    const reactions = countsByPost[p.id] || {};
    const userReaction = userReactionByPost[p.id];
    return {
      ...p,
      reactions,
      ...(userReaction ? {userReaction} : {}),
    };
  });
}
