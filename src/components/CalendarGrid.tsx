import { useEvents, CalendarEvent } from '../contexts/EventContext';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  format,
  startOfDay,
  endOfDay,
  isWithinInterval
} from 'date-fns';
import './CalendarGrid.css';

interface CalendarGridProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarGrid = ({ currentDate, view, onDateClick, onEventClick }: CalendarGridProps) => {
  const { events } = useEvents();

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = startOfDay(event.startTime);
      const eventEnd = endOfDay(event.endTime);
      const checkDate = startOfDay(date);
      
      return isWithinInterval(checkDate, { start: eventStart, end: eventEnd }) ||
             isSameDay(eventStart, checkDate);
    });
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Day names header
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    rows.push(
      <div className="calendar-row calendar-header" key="header">
        {dayNames.map(name => (
          <div key={name} className="calendar-day-name">
            {name}
          </div>
        ))}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = getEventsForDate(cloneDay);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="cell-header">
              <span className="day-number">{format(day, 'd')}</span>
            </div>
            <div className="cell-events">
              {dayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="event-item"
                  style={{ backgroundColor: event.color || 'var(--event-blue)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <span className="event-time">
                    {format(event.startTime, 'h:mm a')}
                  </span>
                  <span className="event-title">{event.title}</span>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="more-events">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="calendar-row" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="calendar-grid month-view">{rows}</div>;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);
      const isToday = isSameDay(day, new Date());

      days.push(
        <div key={i} className={`week-day ${isToday ? 'today' : ''}`} onClick={() => onDateClick(day)}>
          <div className="week-day-header">
            <div className="day-name">{format(day, 'EEE')}</div>
            <div className="day-number">{format(day, 'd')}</div>
          </div>
          <div className="week-day-events">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="event-item"
                style={{ backgroundColor: event.color || 'var(--event-blue)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                <div className="event-time">
                  {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                </div>
                <div className="event-title">{event.title}</div>
                {event.meetLink && <div className="event-meet">📹 Meet</div>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="calendar-grid week-view">{days}</div>;
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="calendar-grid day-view">
        <div className="day-view-header">
          <div className="day-view-date">
            <div className="day-name">{format(currentDate, 'EEEE')}</div>
            <div className="day-number">{format(currentDate, 'MMMM d, yyyy')}</div>
          </div>
        </div>
        <div className="day-view-content" onClick={() => onDateClick(currentDate)}>
          <div className="time-column">
            {hours.map(hour => (
              <div key={hour} className="time-slot">
                <span className="time-label">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </span>
              </div>
            ))}
          </div>
          <div className="events-column">
            {hours.map(hour => (
              <div key={hour} className="hour-slot"></div>
            ))}
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="day-event-item"
                style={{ 
                  backgroundColor: event.color || 'var(--event-blue)',
                  top: `${(event.startTime.getHours() * 60 + event.startTime.getMinutes()) / 12}px`,
                  height: `${((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)) * 60}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                <div className="event-title">{event.title}</div>
                <div className="event-time">
                  {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
};

export default CalendarGrid;

