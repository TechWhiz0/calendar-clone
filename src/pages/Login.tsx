import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/calendar');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h1>Calendar Clone</h1>
            <p className="login-subtitle">Manage your schedule efficiently</p>
          </div>

          <div className="login-content">
            <p className="login-description">
              Sign in with your Google account to access your calendar, create events, 
              schedule tasks, and organize Google Meet sessions.
            </p>

            <button onClick={handleGoogleSignIn} className="google-signin-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="login-features">
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Create events & tasks</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Multiple calendar views</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Google Meet integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

