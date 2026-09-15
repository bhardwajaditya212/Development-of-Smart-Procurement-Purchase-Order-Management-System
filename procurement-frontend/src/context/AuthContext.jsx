import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // ==========================================
  // CURRENT USER
  // ==========================================
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('procurement_user');

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error('Invalid saved user data:', error);
      localStorage.removeItem('procurement_user');
      return null;
    }
  });


  // ==========================================
  // ACTIVE TAB
  // ==========================================
  const [activeTab, setActiveTab] = useState('auth');


  // ==========================================
  // SAVE USER IN LOCAL STORAGE
  // ==========================================
  useEffect(() => {

    if (currentUser) {

      localStorage.setItem(
        'procurement_user',
        JSON.stringify(currentUser)
      );

    } else {

      localStorage.removeItem('procurement_user');

    }

  }, [currentUser]);


  // ==========================================
  // LOGIN
  // ==========================================
  const login = (userData) => {

    console.log('LOGIN SUCCESS:', userData);

    setCurrentUser(userData);

    setActiveTab('overview');
  };


  // ==========================================
  // LOGOUT
  // ==========================================
  const logout = () => {

    console.log('USER LOGGED OUT');

    setCurrentUser(null);

    setActiveTab('auth');
  };


  // ==========================================
  // ADMIN CHECK
  // ==========================================
  const isAdmin =
    currentUser?.role === 'ADMIN';


  // ==========================================
  // CONTEXT
  // ==========================================
  return (
    <AuthContext.Provider
      value={{
        currentUser,

        login,

        logout,

        isAdmin,

        activeTab,

        setActiveTab
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// ==========================================
// CUSTOM HOOK
// ==========================================
export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error(
      'useAuth must be used within an AuthProvider'
    );

  }

  return context;
};