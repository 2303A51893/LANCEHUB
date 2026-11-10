
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin (System Supervisor)',
    email: 'admin@lancehub.com',
    password: 'Password123!',
    name: 'Gunda Venkataramana (Admin)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    role: 'payment_reviewer',
    label: 'Payment Reviewer (Finance)',
    email: 'reviewer@lancehub.com',
    password: 'Password123!',
    name: 'Sarah Jenkins (Finance Reviewer)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    role: 'client',
    label: 'Client (Marcus Vance - TechCorp)',
    email: 'client1@techcorp.com',
    password: 'Password123!',
    name: 'Marcus Vance',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    role: 'freelancer',
    label: 'Freelancer (Alex Chen - Cloud Architect)',
    email: 'freelancer1@dev.com',
    password: 'Password123!',
    name: 'Alex Chen',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('lancehub_token')
  );
  const [loading, setLoading] = useState(true);

  const saveAuth = useCallback((authToken, authUser) => {
    localStorage.setItem('lancehub_token', authToken);
    localStorage.setItem('lancehub_user', JSON.stringify(authUser));

    setToken(authToken);
    setUser(authUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('lancehub_token');
    localStorage.removeItem('lancehub_user');

    setToken(null);
    setUser(null);
  }, []);

  // Initialize authentication
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('lancehub_token');

      if (!storedToken) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get('/auth/me');

        if (!cancelled && res.data.success && res.data.user) {
          setUser(res.data.user);
          setToken(storedToken);
        } else if (!cancelled) {
          clearAuth();
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);

        if (!cancelled) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, [clearAuth]);

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    });

    if (res.data.success && res.data.token && res.data.user) {
      saveAuth(res.data.token, res.data.user);
      return res.data.user;
    }

    throw new Error(res.data.message || 'Login failed');
  };

  // Register
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);

    if (res.data.success && res.data.token && res.data.user) {
      saveAuth(res.data.token, res.data.user);
      return res.data.user;
    }

    throw new Error(res.data.message || 'Registration failed');
  };

  // Quick demo login
  const quickLogin = async (demoRole) => {
    const account = DEMO_ACCOUNTS.find(
      (item) => item.role === demoRole
    );

    if (!account) {
      throw new Error('Demo account not found');
    }

    return login(account.email, account.password);
  };

  // Logout
  const logout = () => {
    clearAuth();
  };

  // Refresh user profile
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem(
          'lancehub_user',
          JSON.stringify(res.data.user)
        );

        return res.data.user;
      }

      return null;
    } catch (error) {
      console.error('Profile refresh failed:', error);

      if (error.response?.status === 401) {
        clearAuth();
      }

      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        quickLogin,
        logout,
        refreshUser,
        isAdmin: user?.role === 'admin',
        isClient: user?.role === 'client',
        isFreelancer: user?.role === 'freelancer',
        isReviewer: user?.role === 'payment_reviewer'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
