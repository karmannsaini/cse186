import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import PostCard from './PostCard.jsx';
import {postShape, groupsPropType} from './postPropTypes.js';

/**
 * List of posts.
 * @param {object} props component props
 * @param {Array<object>} props.posts posts to display
 * @param {Array<{id: string|number, name: string}>} [props.groups] groups label
 * @param {(postId: number, text: string) => void} [props.onPostUpdated]
 *   callback when a post is edited
 * @param {(postId: number) => void} [props.onPostDeleted]
 *   callback when a post is deleted
 * @returns {object} list element
 */
function PostList({posts, groups = [], onPostUpdated, onPostDeleted}) {
  return (
    <Box sx={{mt: 2}}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          groups={groups}
          onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted}
        />
      ))}
    </Box>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(postShape).isRequired,
  groups: groupsPropType,
  onPostUpdated: PropTypes.func,
  onPostDeleted: PropTypes.func,
};

export default PostList;
