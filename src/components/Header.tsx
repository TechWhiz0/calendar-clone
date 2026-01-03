import { User } from 'firebase/auth';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const Header = ({
  currentUser,
  onSignOut,
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: HeaderProps) => {
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      year: 'numeric' 
    };
    
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric' 
      });
    }
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <header className="calendar-header">
      <div className="header-left">
        <button className="menu-btn">
          <Menu size={20} />
        </button>
        <div className="logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">Calendar</span>
        </div>
      </div>

      <div className="header-center">
        <button className="today-btn" onClick={onToday}>
          Today
        </button>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={onPrevious}>
            <ChevronLeft size={20} />
          </button>
          <button className="nav-btn" onClick={onNext}>
            <ChevronRight size={20} />
          </button>
        </div>
        <h2 className="current-date">{formatDate()}</h2>
      </div>

      <div className="header-right">
        <div className="view-switcher">
          <button
            className={`view-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => onViewChange('day')}
          >
            Day
          </button>
          <button
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => onViewChange('week')}
          >
            Week
          </button>
          <button
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => onViewChange('month')}
          >
            Month
          </button>
        </div>
        
        {currentUser && (
          <div className="user-menu">
            <img
              src={currentUser.photoURL || 'https://via.placeholder.com/40'}
              alt="User"
              className="user-avatar"
            />
            <button className="signout-btn" onClick={onSignOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

