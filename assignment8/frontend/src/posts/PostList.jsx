import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import PostCard from './PostCard.jsx';
import {postShape, groupsPropType} from './postPropTypes.js';

/**
 * List of posts.
 * @param {object} props component props
 * @param {Array<object>} props.posts posts to display
 * @param {Array<{id: string|number, name: string}>} [props.groups] groups label
 * @returns {object} list element
 */
function PostList({posts, groups = []}) {
  return (
    <Box sx={{mt: 2}}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} groups={groups} />
      ))}
    </Box>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(postShape).isRequired,
  groups: groupsPropType,
};

export default PostList;
