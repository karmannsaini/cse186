import {useContext, useState} from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {MailProvider, MailContext} from './MailContext';
import MailboxList from './mailbox/List';
import MailList from './mailbox/MailList';
import MailViewer from './mailbox/MailViewer';

const drawerWidth = 240;

const MainLayout = () => {
  const {mailbox, activeEmail, setActiveEmail} = useContext(MailContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleBack = () => {
    setActiveEmail(null);
  };

  // Logic moved here to satisfy the 80-char linter limit
  const mailboxTitle = mailbox.charAt(0).toUpperCase() + mailbox.slice(1);
  const title = `CSE186 Full Stack Mail - ${mailboxTitle}`;

  return (
    <Box sx={{display: 'flex', height: '100vh'}}>
      <CssBaseline />

      {/* The Blue Application Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#1976d2',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{mr: 2, display: {sm: 'none'}}}
          >
            <MenuIcon />
          </IconButton>

          {activeEmail && (
            <IconButton
              color="inherit"
              aria-label="back to mail list"
              onClick={handleBack}
              sx={{mr: 2, display: {sm: 'none'}}}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Responsive Sidebar Navigation */}
      <Box
        component="nav"
        sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{keepMounted: true}}
          sx={{
            'display': {xs: 'block', sm: 'none'},
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <Toolbar />
          <Box onClick={handleDrawerToggle} sx={{overflow: 'auto'}}>
            <MailboxList />
          </Box>
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            'display': {xs: 'none', sm: 'block'},
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          <Toolbar />
          <Box sx={{overflow: 'auto'}}>
            <MailboxList />
          </Box>
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: {sm: `calc(100% - ${drawerWidth}px)`},
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Box sx={{flexGrow: 1, overflow: 'auto', p: 2}}>
          {activeEmail ? <MailViewer /> : <MailList />}
        </Box>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <MailProvider>
      <MainLayout />
    </MailProvider>
  );
};

export default App;
