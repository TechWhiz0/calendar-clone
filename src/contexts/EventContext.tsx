import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  type: 'event' | 'task';
  meetLink?: string;
  userId: string;
}

interface EventContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  loading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'events'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: CalendarEvent[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          color: data.color,
          type: data.type,
          meetLink: data.meetLink,
          userId: data.userId,
        };
      });
      setEvents(eventsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'userId'>) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'events'), {
        ...event,
        startTime: Timestamp.fromDate(event.startTime),
        endTime: Timestamp.fromDate(event.endTime),
        userId: currentUser.uid,
      });
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, eventUpdate: Partial<CalendarEvent>) => {
    try {
      const eventRef = doc(db, 'events', id);
      const updateData: any = { ...eventUpdate };
      
      if (eventUpdate.startTime) {
        updateData.startTime = Timestamp.fromDate(eventUpdate.startTime);
      }
      if (eventUpdate.endTime) {
        updateData.endTime = Timestamp.fromDate(eventUpdate.endTime);
      }
      
      await updateDoc(eventRef, updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    loading,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

