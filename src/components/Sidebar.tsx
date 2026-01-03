import { Plus } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  onCreateEvent: () => void;
}

const Sidebar = ({ onCreateEvent }: SidebarProps) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const renderMiniCalendar = () => {
    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Day names
    dayNames.forEach((day, index) => {
      days.push(
        <div key={`day-${index}`} className="mini-cal-day-name">
          {day}
        </div>
      );
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="mini-cal-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && 
                     currentMonth === today.getMonth() && 
                     currentYear === today.getFullYear();
      
      days.push(
        <div
          key={`date-${day}`}
          className={`mini-cal-day ${isToday ? 'today' : ''}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <aside className="sidebar">
      <button className="create-btn" onClick={onCreateEvent}>
        <Plus size={24} />
        <span>Create</span>
      </button>

      <div className="mini-calendar">
        <div className="mini-cal-header">
          <span>{monthName}</span>
        </div>
        <div className="mini-cal-grid">
          {renderMiniCalendar()}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

