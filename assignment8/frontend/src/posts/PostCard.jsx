import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

/**
 * Display a single post.
 * @param {object} props component props
 * @param {object} props.post post to display
 * @returns {object} card element
 */
function PostCard({post}) {
  const raw = post?.content;
  const text =
    (typeof raw === 'string' ? raw : (raw?.text ?? '')) || '(No content)';
  const truncated = text.length > 500 ?
    `${text.slice(0, 497)}...` :
    text;
  const createdAt = raw?.createdAt;
  const dateStr = createdAt ?
    new Date(createdAt).toLocaleString() :
    '';

  return (
    <Card sx={{mb: 2}}>
      <CardContent>
        <Typography
          variant="body1"
          component="div"
          sx={{
            whiteSpace: 'pre-wrap',
            mb: 1.5,
            minHeight: '1.5em',
            color: 'text.primary',
          }}
        >
          {truncated}
        </Typography>
        {dateStr && (
          <Typography variant="caption" color="text.secondary" component="div">
            Posted {dateStr}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    authorId: PropTypes.number.isRequired,
    content: PropTypes.shape({
      text: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      visibility: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default PostCard;

