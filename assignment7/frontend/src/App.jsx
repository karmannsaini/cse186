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

  return (
    <Box sx={{display: 'flex', height: '100vh'}}>
      <CssBaseline />

      {/* The Blue Application Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#1976d2', // Standard MUI Blue matching the wireframe
        }}
      >
        <Toolbar>
          {/* Hamburger menu for mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{mr: 2, display: {sm: 'none'}}}
          >
            <MenuIcon />
          </IconButton>

          {/* Back button when viewing an email on mobile */}
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
            Kmail - {mailbox}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Responsive Sidebar Navigation */}
      <Box
        component="nav"
        sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
      >
        {/* Mobile Drawer */}
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
          <Toolbar /> {/* Spacer for header */}
          <Box onClick={handleDrawerToggle} sx={{overflow: 'auto'}}>
            <MailboxList />
          </Box>
        </Drawer>

        {/* Desktop Permanent Drawer */}
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
          <Toolbar /> {/* Spacer for header */}
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
        <Toolbar /> {/* Spacer to push content below the fixed header */}

        {/* Conditional Rendering preserves the TDD requirements */}
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
