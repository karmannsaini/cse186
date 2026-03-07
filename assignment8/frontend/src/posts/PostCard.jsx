import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {postShape, groupsPropType} from './postPropTypes.js';

/**
 * Display a single post.
 * @param {object} props component props
 * @param {object} props.post post to display
 * @param {Array<{id: string|number, name: string}>} [props.groups] group names
 * @returns {object} card element
 */
function PostCard({post, groups = []}) {
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
  const authorName = post?.authorDisplayName || 'Someone';
  const groupId = raw?.groupId;
  const group = groupId ?
    groups.find((g) => String(g.id) === String(groupId)) :
    null;
  const groupName = group?.name || null;
  const subtitle =
    groupName != null ?
      `Group Post by ${authorName} into ${groupName}` :
      `Public Post from ${authorName}`;

  return (
    <Card sx={{mb: 2}}>
      <CardContent>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          component="div"
          sx={{mb: 1}}
        >
          {subtitle}
        </Typography>
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
  post: postShape.isRequired,
  groups: groupsPropType,
};

export default PostCard;

