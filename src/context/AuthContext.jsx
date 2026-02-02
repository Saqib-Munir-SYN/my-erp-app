import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const HARDCODED_USER = {
  username: 'admin',
  password: 'admin123',
  name: 'Admin User',
  role: 'Administrator'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('erp_session');
    const guestMode = localStorage.getItem('erp_guest');
    
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const hoursSinceLogin = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
          setUser(parsed.user);
        } else {
          localStorage.removeItem('erp_session');
        }
      } catch (e) {
        localStorage.removeItem('erp_session');
      }
    } else if (guestMode === 'true') {
      setIsGuest(true);
    }
    
    setLoading(false);
  }, []);

  const login = (username, password, remember = false) => {
    if (username === HARDCODED_USER.username && password === HARDCODED_USER.password) {
      const userData = {
        username: HARDCODED_USER.username,
        name: HARDCODED_USER.name,
        role: HARDCODED_USER.role
      };
      
      setUser(userData);
      setIsGuest(false);
      localStorage.removeItem('erp_guest');
      
      const session = {
        user: userData,
        timestamp: Date.now(),
        remember
      };
      localStorage.setItem('erp_session', JSON.stringify(session));
      
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const skipLogin = () => {
    setIsGuest(true);
    setUser(null);
    localStorage.setItem('erp_guest', 'true');
    localStorage.removeItem('erp_session');
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('erp_session');
    localStorage.removeItem('erp_guest');
  };

  const isAuthenticated = !!user || isGuest;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isGuest, 
      isAuthenticated, 
      login, 
      logout, 
      skipLogin,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}