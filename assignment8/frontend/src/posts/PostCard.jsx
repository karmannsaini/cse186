import {useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SentimentSatisfiedAltIcon from
  '@mui/icons-material/SentimentSatisfiedAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentDissatisfiedIcon from
  '@mui/icons-material/SentimentDissatisfied';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {postShape, groupsPropType} from './postPropTypes.js';
import {useAuth} from '../auth/AuthContext.jsx';

const REACTION_TYPES = [
  {key: 'like', label: 'Like', icon: ThumbUpIcon},
  {key: 'love', label: 'Love', icon: FavoriteIcon},
  {key: 'haha', label: 'Haha', icon: SentimentSatisfiedAltIcon},
  {key: 'wow', label: 'Wow', icon: EmojiEventsIcon},
  {key: 'sad', label: 'Sad', icon: SentimentDissatisfiedIcon},
  {key: 'angry', label: 'Angry', icon: WhatshotIcon},
];

const API_BASE = 'http://localhost:3010/api/v0';

/**
 * Display a single post with reaction controls and counts.
 * @param {object} props component props
 * @param {object} props.post post to display
 * @param {Array<{id: string|number, name: string}>} [props.groups] group names
 * @param {(postId: number, text: string) => void} [props.onPostUpdated]
 *   callback when saved
 * @param {(postId: number) => void} [props.onPostDeleted] callback when deleted
 * @returns {object} card element
 */
function PostCard({post, groups = [], onPostUpdated, onPostDeleted}) {
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
  const {user, token} = useAuth();
  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const [reactions, setReactions] = useState(post.reactions || {});
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(text);
  const subtitle =
    groupName != null ?
      `Group Post by ${authorName} into ${groupName}` :
      `Public Post from ${authorName}`;

  const isAuthor =
    user &&
    Number.isFinite(user.id) &&
    Number(user.id) === post.authorId;

  const callPostApi = async (method, body) => {
    if (!token) return false;
    try {
      const url = `${API_BASE}/posts/${post.id}`;
      const response = await fetch(url, {
        method,
        headers: {
          ...(body ? {'Content-Type': 'application/json'} : {}),
          'Authorization': `Bearer ${token}`,
        },
        ...(body ? {body: JSON.stringify(body)} : {}),
      });
      return !!response.ok;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    const ok = await callPostApi('PATCH', {text: draftText});
    if (!ok) return;
    onPostUpdated && onPostUpdated(post.id, draftText);
    setEditing(false);
  };

  const handleDelete = async () => {
    const ok = await callPostApi('DELETE');
    if (!ok) return;
    onPostDeleted && onPostDeleted(post.id);
  };

  const handleReactionClick = async (key) => {
    if (!token) {
      return;
    }
    const current = userReaction;
    const next = current === key ? null : key;
    const url = `${API_BASE}/posts/${post.id}/reactions`;
    try {
      if (next === null) {
        await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({type: next}),
        });
      }
      setUserReaction(next);
      setReactions((prev) => {
        const updated = {...prev};
        if (current && updated[current] != null) {
          updated[current] = Math.max(0, updated[current] - 1);
        }
        if (next) {
          updated[next] = (updated[next] || 0) + 1;
        }
        return updated;
      });
    } catch {
      // ignore; UI will remain unchanged on error
    }
  };

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
        {!editing ? (
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
        ) : (
          <Stack spacing={1} sx={{mb: 1.5}}>
            <TextField
              label="Edit post"
              value={draftText}
              multiline
              minRows={2}
              onChange={(e) => setDraftText(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setDraftText(text);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
        {dateStr && (
          <Typography variant="caption" color="text.secondary" component="div">
            Posted {dateStr}
          </Typography>
        )}
        {isAuthor && (
          <Stack direction="row" spacing={1} sx={{mt: 1}}>
            <IconButton
              size="small"
              aria-label="Edit post"
              onClick={() => setEditing(true)}
              disabled={editing}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Delete post"
              onClick={handleDelete}
              disabled={editing}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{mt: 1}}>
          {REACTION_TYPES.map(({key, label, icon: Icon}) => (
            <Stack
              key={key}
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              <IconButton
                size="small"
                color={userReaction === key ? 'primary' : 'default'}
                aria-label={label}
                onClick={() => handleReactionClick(key)}
              >
                <Icon fontSize="small" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                {reactions?.[key] ?? 0}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

PostCard.propTypes = {
  post: postShape.isRequired,
  groups: groupsPropType,
  onPostUpdated: PropTypes.func,
  onPostDeleted: PropTypes.func,
};

export default PostCard;

