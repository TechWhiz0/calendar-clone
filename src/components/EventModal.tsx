import { useState, useEffect } from 'react';
import { X, Calendar, AlignLeft, Video, Trash2 } from 'lucide-react';
import { useEvents, CalendarEvent } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { createInstantMeetLink } from '../utils/meetUtils';
import { format } from 'date-fns';
import './EventModal.css';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  editingEvent: CalendarEvent | null;
}

const EventModal = ({ isOpen, onClose, selectedDate, editingEvent }: EventModalProps) => {
  const { addEvent, updateEvent, deleteEvent } = useEvents();
  const { currentUser, getAccessToken } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState<'event' | 'task'>('event');
  const [color, setColor] = useState('#4299e1');
  const [includeMeet, setIncludeMeet] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [generatingMeet, setGeneratingMeet] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setStartDate(format(editingEvent.startTime, 'yyyy-MM-dd'));
      setStartTime(format(editingEvent.startTime, 'HH:mm'));
      setEndDate(format(editingEvent.endTime, 'yyyy-MM-dd'));
      setEndTime(format(editingEvent.endTime, 'HH:mm'));
      setEventType(editingEvent.type);
      setColor(editingEvent.color || '#4299e1');
      setIncludeMeet(!!editingEvent.meetLink);
      setMeetLink(editingEvent.meetLink || '');
    } else if (selectedDate) {
      const date = format(selectedDate, 'yyyy-MM-dd');
      setTitle('');
      setDescription('');
      setStartDate(date);
      setStartTime('09:00');
      setEndDate(date);
      setEndTime('10:00');
      setEventType('event');
      setColor('#4299e1');
      setIncludeMeet(false);
      setMeetLink('');
    }
  }, [editingEvent, selectedDate]);

  const generateMeetLink = async () => {
    if (!currentUser) return;
    
    setGeneratingMeet(true);
    try {
      // Get the Google OAuth access token
      const token = await getAccessToken();
      
      if (!token) {
        alert(`⚠️ No Calendar API Access Token

Please sign out and sign back in to grant Calendar permissions.

Steps:
1. Click "Sign Out"
2. Sign in again with Google
3. Grant Calendar permissions when prompted
4. Try again!`);
        setGeneratingMeet(false);
        return;
      }
      
      const link = await createInstantMeetLink(token);
      if (link) {
        setMeetLink(link);
        console.log('✅ Real Google Meet link generated:', link);
      }
    } catch (error: any) {
      console.error('Error generating Meet link:', error);
      
      if (error.message === 'CALENDAR_API_NOT_ENABLED') {
        alert(`📋 Google Calendar API Not Enabled

To auto-generate Meet links:

1. Go to: https://console.cloud.google.com
2. Select project: calender-716f2
3. Go to "APIs & Services" → "Library"
4. Search "Google Calendar API" and ENABLE it
5. Sign out and sign back in

For now, use the 🎥 button to create Meet links manually.`);
      } else if (error.message === 'UNAUTHORIZED' || error.message === 'NO_ACCESS_TOKEN') {
        alert(`🔐 Authorization Required

Please sign out and sign back in to grant Calendar API permissions.`);
      } else {
        alert(`❌ Error: ${error.message || 'Failed to generate Meet link'}

Check the console for more details.`);
      }
    } finally {
      setGeneratingMeet(false);
    }
  };

  const openGoogleMeet = () => {
    // Open Google Meet in a new tab to create a real meeting
    window.open('https://meet.google.com/new', '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      startTime: startDateTime,
      endTime: endDateTime,
      type: eventType,
      color,
      meetLink: includeMeet && meetLink ? meetLink : undefined,
    };

    try {
      if (editingEvent && editingEvent.id) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (editingEvent && editingEvent.id) {
      if (window.confirm('Are you sure you want to delete this event?')) {
        try {
          await deleteEvent(editingEvent.id);
          onClose();
        } catch (error) {
          console.error('Error deleting event:', error);
          alert('Failed to delete event. Please try again.');
        }
      }
    }
  };

  const colors = [
    { name: 'Blue', value: '#4299e1' },
    { name: 'Purple', value: '#9f7aea' },
    { name: 'Green', value: '#48bb78' },
    { name: 'Orange', value: '#ed8936' },
    { name: 'Red', value: '#f56565' },
    { name: 'Teal', value: '#38b2ac' },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <div className="event-type-selector">
              <button
                type="button"
                className={`type-btn ${eventType === 'event' ? 'active' : ''}`}
                onClick={() => setEventType('event')}
              >
                Event
              </button>
              <button
                type="button"
                className={`type-btn ${eventType === 'task' ? 'active' : ''}`}
                onClick={() => setEventType('task')}
              >
                Task
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <Calendar size={20} />
            </div>
            <div className="date-time-inputs">
              <div className="date-time-row">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <span className="separator">to</span>
              <div className="date-time-row">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <AlignLeft size={20} />
            </div>
            <textarea
              placeholder="Add description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-input"
              rows={3}
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <Video size={20} />
            </div>
            <div className="meet-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeMeet}
                  onChange={(e) => {
                    setIncludeMeet(e.target.checked);
                    // Auto-generate Meet link when checkbox is checked
                    if (e.target.checked && !meetLink) {
                      generateMeetLink();
                    }
                  }}
                />
                <span>Add Google Meet video conferencing</span>
              </label>
              {includeMeet && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="url"
                    placeholder={generatingMeet ? "Generating Meet link..." : "Meet link will appear here"}
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="meet-link-input"
                    disabled={generatingMeet}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={generateMeetLink}
                      disabled={generatingMeet}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: generatingMeet ? '#ccc' : 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: generatingMeet ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: generatingMeet ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      {generatingMeet ? '⏳ Generating...' : '✨ Auto-generate Meet Link'}
                    </button>
                    <button
                      type="button"
                      onClick={openGoogleMeet}
                      style={{
                        padding: '10px 16px',
                        background: 'var(--surface)',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'white'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
                      title="Create manually"
                    >
                      🎥
                    </button>
                  </div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)', 
                    margin: 0 
                  }}>
                    ✨ Real Google Meet links generated automatically, or create manually
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <div className="color-dot" style={{ backgroundColor: color }}></div>
            </div>
            <div className="color-picker">
              <label>Event Color</label>
              <div className="color-options">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`color-option ${color === c.value ? 'selected' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.name}
                  >
                    {color === c.value && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <div className="footer-left">
              {editingEvent && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={handleDelete}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </div>
            <div className="footer-right">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                {editingEvent ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;

