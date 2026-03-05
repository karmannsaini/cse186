import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import PostCard from './PostCard.jsx';

/**
 * List of posts.
 * @param {object} props component props
 * @param {Array<object>} props.posts posts to display
 * @returns {object} list element
 */
function PostList({posts}) {
  return (
    <Box sx={{mt: 2}}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Box>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    authorId: PropTypes.number.isRequired,
    content: PropTypes.shape({
      text: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      visibility: PropTypes.string,
    }).isRequired,
  })).isRequired,
};

export default PostList;

