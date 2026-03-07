/*
#######################################################################
#
# Copyright (C) 2020-2026  David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {AuthProvider, useAuth} from './auth/AuthContext.jsx';
import LoginPage from './auth/LoginPage.jsx';
import HomePage from './home/HomePage.jsx';
import NotFoundPage from './NotFoundPage.jsx';

/**
 * Application routes. Must be rendered inside a Router
 * (e.g. BrowserRouter or MemoryRouter).
 * @returns {object} routes element
 */
export function AppRoutes() {
  const {user} = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? '/home' : '/login'} replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <LoginPage />}
      />
      <Route
        path="/home"
        element={
          user ? <HomePage title="Home" /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/home/group/:groupId"
        element={
          user ? <HomePage title="Home" /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

/**
 * Root application component.
 * @returns {object} root element
 */
function App() {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
