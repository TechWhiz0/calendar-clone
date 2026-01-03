import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider as GoogleAuthProviderType
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  googleAccessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the Google OAuth access token (not Firebase ID token!)
      const credential = GoogleAuthProviderType.credentialFromResult(result);
      if (credential?.accessToken) {
        console.log('✅ Got Google OAuth access token with Calendar permissions');
        setGoogleAccessToken(credential.accessToken);
        // Store in localStorage for persistence
        localStorage.setItem('googleAccessToken', credential.accessToken);
      } else {
        console.warn('⚠️ No access token received. Calendar API may not work.');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setGoogleAccessToken(null);
      localStorage.removeItem('googleAccessToken');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    // Return the Google OAuth access token (not Firebase ID token)
    if (googleAccessToken) {
      return googleAccessToken;
    }
    
    // Try to get from localStorage
    const storedToken = localStorage.getItem('googleAccessToken');
    if (storedToken) {
      setGoogleAccessToken(storedToken);
      return storedToken;
    }
    
    console.warn('⚠️ No Google OAuth access token available. Please sign out and sign in again.');
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Try to restore access token from localStorage
      if (user) {
        const storedToken = localStorage.getItem('googleAccessToken');
        if (storedToken) {
          setGoogleAccessToken(storedToken);
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
    getAccessToken,
    googleAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

