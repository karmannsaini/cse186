import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';
import {useAuth} from '../auth/AuthContext.jsx';
import PostList from '../posts/PostList.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

const API_BASE = 'http://localhost:3010/api/v0';

/**
 * App bar with title and logout; optional menu icon and user display.
 * @param {object} props component props
 * @param {string} props.title bar title
 * @param {() => void} props.onLogout logout handler
 * @param {object} [props.menuButton] optional menu icon element
 * @param {object} [props.userDisplay] optional user text element
 * @returns {object} AppBar element
 */
function PageAppBar({title, onLogout, menuButton, userDisplay}) {
  return (
    <AppBar position="static">
      <Toolbar>
        {menuButton}
        <Typography variant="h6" sx={{flexGrow: 1}}>{title}</Typography>
        {userDisplay}
        <Button color="inherit" onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

PageAppBar.propTypes = {
  title: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
  menuButton: PropTypes.node,
  userDisplay: PropTypes.node,
};

/**
 * Home page after login. Shows all posts or posts for a selected group.
 * @param {object} props component props
 * @param {string} props.title app bar title when no group selected
 * @returns {object} home layout
 */
function HomePage({title}) {
  const {groupId} = useParams();
  const navigate = useNavigate();
  const {user, token, logout} = useAuth();
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupsError, setGroupsError] = useState('');
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostError, setNewPostError] = useState('');
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  // When switching groups, collapse any open members list and clear errors.
  useEffect(() => {
    setMembers([]);
    setMembersError('');
  }, [groupId]);

  useEffect(() => {
    let active = true;
    setGroupsError('');
    setGroupsLoaded(false);
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/groups`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        if (!response.ok) {
          if (active) {
            setGroupsError('Unable to load groups');
            setGroupsLoaded(true);
          }
          return;
        }
        const data = await response.json();
        if (active) {
          setGroups(Array.isArray(data) ? data : []);
          setGroupsLoaded(true);
        }
      } catch {
        if (active) {
          setGroupsError('Unable to load groups');
          setGroupsLoaded(true);
        }
      }
    };
    if (token) load();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const url = groupId ?
          `${API_BASE}/groups/${groupId}/posts` :
          `${API_BASE}/posts`;
        const response = await fetch(url, {
          headers: {Authorization: `Bearer ${token}`},
        });
        if (!response.ok) {
          throw new Error('Failed to load posts');
        }
        const data = await response.json();
        if (active) setPosts(data);
      } catch {
        if (active) setError('Unable to load posts');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) load();
    return () => {
      active = false;
    };
  }, [token, groupId]);

  const selectedGroup = groups.find((g) => String(g.id) === groupId);
  const invalidGroup =
    groupId && groupsLoaded && !selectedGroup;
  const appBarTitle =
    selectedGroup ? selectedGroup.name : title;
  const feedHeading =
    selectedGroup ? `${selectedGroup.name}` : 'Welcome to your feed';

  const canCreate =
    Boolean(token) && newPostText !== '' && !loading;

  const drawerList = (
    <List>
      <ListItemButton
        selected={!groupId}
        onClick={() => handleNav('/home')}
      >
        <ListItemText primary="All posts" />
      </ListItemButton>
      {groups.map((g) => (
        <ListItemButton
          key={g.id}
          selected={String(g.id) === groupId}
          onClick={() => handleNav(`/home/group/${g.id}`)}
        >
          <ListItemText primary={g.name} />
        </ListItemButton>
      ))}
    </List>
  );

  if (invalidGroup) {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <PageAppBar title={title} onLogout={handleLogout} />
        <NotFoundPage />
      </Box>
    );
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <PageAppBar
        title={appBarTitle}
        onLogout={handleLogout}
        menuButton={
          <IconButton
            color="inherit"
            aria-label="open menu"
            onClick={() => setMobileDrawerOpen(true)}
            sx={{mr: 1, display: {xs: 'block', md: 'none'}}}
          >
            <MenuIcon />
          </IconButton>
        }
        userDisplay={
          user ? (
            <Typography variant="body1">{user.displayName}</Typography>
          ) : null
        }
      />
      <Box sx={{display: 'flex', flex: 1}}>
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{keepMounted: true}}
          sx={{
            'display': {xs: 'block', md: 'none'},
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerList}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            'display': {xs: 'none', md: 'block'},
            'width': 240,
            'flexShrink': 0,
            '& .MuiDrawer-paper': {
              'width': 240,
              'boxSizing': 'border-box',
            },
          }}
        >
          {drawerList}
        </Drawer>
        <Container component="main" sx={{mt: 2, flex: 1}}>
          {groupsError && (
            <Typography variant="body2" color="error" sx={{mb: 1}}>
              {groupsError}
            </Typography>
          )}
          <Typography variant="h5" gutterBottom>
            {feedHeading}
          </Typography>
          {selectedGroup && (
            <Box sx={{mb: 1, display: 'flex', alignItems: 'center', gap: 1}}>
              <Button
                variant="outlined"
                size="small"
                disabled={membersLoading || !groupId || !token}
                onClick={async () => {
                  setMembersError('');
                  setMembers([]);
                  setMembersLoading(true);
                  try {
                    const response = await fetch(
                        `${API_BASE}/groups/${groupId}/members`,
                        {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                          },
                        },
                    );
                    if (!response.ok) {
                      setMembersError('Unable to load group members');
                      return;
                    }
                    const data = await response.json();
                    setMembers(data);
                  } catch {
                    setMembersError('Unable to load group members');
                  } finally {
                    setMembersLoading(false);
                  }
                }}
              >
                {membersLoading ? 'Loading members…' : 'View members'}
              </Button>
              {membersError && (
                <Typography variant="body2" color="error">
                  {membersError}
                </Typography>
              )}
            </Box>
          )}
          {selectedGroup && members.length > 0 && (
            <Box sx={{mb: 2}}>
              <Typography variant="subtitle2">
                Members of {selectedGroup.name}
              </Typography>
              <List dense>
                {members.map((m) => (
                  <ListItemText
                    key={m.id}
                    primary={m.displayName}
                  />
                ))}
              </List>
            </Box>
          )}
          <Box sx={{mb: 2}}>
            <TextField
              label="What do you want to share?"
              multiline
              minRows={2}
              fullWidth
              value={newPostText}
              onChange={(e) => {
                setNewPostText(e.target.value);
                setNewPostError('');
              }}
              error={newPostText.trim() === '' && newPostText !== ''}
              helperText={
                newPostText.trim() === '' && newPostText !== '' ?
                  'Post text is required' :
                  ''
              }
            />
            {newPostError && (
              <Typography variant="body2" color="error" sx={{mt: 0.5}}>
                {newPostError}
              </Typography>
            )}
            <Box sx={{mt: 1, textAlign: 'right'}}>
              <Button
                variant="contained"
                disabled={!canCreate}
                onClick={async () => {
                  const trimmed = newPostText.trim();
                  if (!trimmed) {
                    setNewPostError('Post text is required');
                    return;
                  }
                  try {
                    const response = await fetch(`${API_BASE}/posts`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        text: trimmed,
                        ...(selectedGroup ?
                          {groupId: selectedGroup.id} :
                          {}),
                      }),
                    });
                    if (!response.ok) {
                      setNewPostError('Unable to create post');
                      return;
                    }
                    const created = await response.json();
                    setPosts((prev) => [created, ...prev]);
                    setNewPostText('');
                    setNewPostError('');
                  } catch {
                    setNewPostError('Unable to create post');
                  }
                }}
              >
                Post
              </Button>
            </Box>
          </Box>
          {loading && (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
              <CircularProgress />
            </Box>
          )}
          {!loading && error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          {!loading && !error && posts.length === 0 && !groupId && (
            <Typography variant="body1">
              Nothing here yet as you only have one end point in your API.
            </Typography>
          )}
          {!loading && !error && posts.length === 0 && groupId && (
            <Typography variant="body1">
              No posts in this group.
            </Typography>
          )}
          {!loading && !error && posts.length > 0 && (
            <PostList
              posts={posts}
              groups={groups}
              onPostUpdated={(postId, text) => {
                setPosts((prev) => prev.map((p) => (
                  Number(p.id) === postId ?
                    {...p, content: {...p.content, text}} :
                    p
                )));
              }}
              onPostDeleted={(postId) => {
                setPosts((prev) => prev.filter((p) => p.id !== postId));
              }}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
}

HomePage.propTypes = {
  title: PropTypes.string,
};

HomePage.defaultProps = {
  title: 'Home',
};

export default HomePage;

