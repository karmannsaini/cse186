import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

const AUTH_STORAGE_KEY = 'auth';

/** React context for auth. Exported for tests that need to inject auth. */
export const AuthContext = createContext(null);

/**
 * Use the authentication context.
 * @returns {object} Auth context value
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/**
 * Read stored auth from localStorage for rehydration on refresh/new tab.
 * @returns {{user: object|null, token: string|null}}
 *   Stored user and token, or nulls if missing/invalid.
 */
function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const {user: u, token: t} = JSON.parse(raw);
      if (u && t) {
        return {user: u, token: t};
      }
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return {user: null, token: null};
}

/**
 * Provide authentication state to descendants.
 * Persists token and user in localStorage so refresh and new tabs keep login.
 * @param {object} props component props
 * @param {React.ReactNode} props.children children
 * @returns {object} Provider element
 */
export function AuthProvider({children}) {
  const [{user, token}, setAuth] = useState(readStoredAuth);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({user, token}),
      );
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user, token]);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:3010/api/v0/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAuth({user: data.user, token: data.token});
  };

  const logout = () => {
    setAuth({user: null, token: null});
  };

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
  }), [user, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

