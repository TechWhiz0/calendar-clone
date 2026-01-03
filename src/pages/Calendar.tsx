import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CalendarGrid from '../components/CalendarGrid';
import EventModal from '../components/EventModal';
import { CalendarEvent } from '../contexts/EventContext';
import './Calendar.css';

const Calendar = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.startTime);
    setIsEventModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="calendar-page">
      <Header
        currentUser={currentUser}
        onSignOut={handleSignOut}
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />
      <div className="calendar-content">
        <Sidebar onCreateEvent={() => setIsEventModalOpen(true)} />
        <CalendarGrid
          currentDate={currentDate}
          view={view}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          editingEvent={editingEvent}
        />
      )}
    </div>
  );
};

export default Calendar;

