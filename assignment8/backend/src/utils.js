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
