import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, isAfter, startOfDay } from 'date-fns';
import SymptomModal from './SymptomModal';
import { SymptomEntry, UserProgress } from '../types';
import { getSymptomEntry, saveSymptomEntry, updateUserProgress, subscribeToSymptomEntries, getAllSymptomEntries } from '../lib/database';
import toast from 'react-hot-toast';

interface CalendarProps {
  userId: string;
  progress: UserProgress;
  onProgressUpdate: (progress: UserProgress) => void;
}

const Calendar: React.FC<CalendarProps> = ({ userId, progress, onProgressUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingEntry, setExistingEntry] = useState<SymptomEntry | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [currentMonthEntries, setCurrentMonthEntries] = useState<SymptomEntry[]>([]);

  // Get current month key
  const getCurrentMonthKey = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Check if date belongs to current month
  const isCurrentMonth = (dateString: string): boolean => {
    const date = new Date(dateString);
    const dateMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return dateMonthKey === getCurrentMonthKey();
  };

  useEffect(() => {
    loadCurrentMonthEntries();
  }, [userId]);

  useEffect(() => {
    // Subscribe to real-time updates for current month
    const subscription = subscribeToSymptomEntries(userId, (entries) => {
      console.log('📅 Real-time update received:', entries);
      setCurrentMonthEntries(entries);
      updateCalendarEvents(entries);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    // Update calendar when progress changes
    updateCalendarEvents(currentMonthEntries);
  }, [progress, currentMonthEntries]);

  const loadCurrentMonthEntries = async () => {
    try {
      console.log('📅 Loading current month entries...');
      const entries = await getAllSymptomEntries(userId);
      console.log('📊 Current month entries loaded:', entries);
      setCurrentMonthEntries(entries);
      updateCalendarEvents(entries);
    } catch (error) {
      console.error('Error loading current month entries:', error);
    }
  };

  const updateCalendarEvents = (entries: SymptomEntry[]) => {
    console.log('🗓️ Updating calendar events with entries:', entries);
    
    // Create events from actual database entries
    const calendarEvents = entries.map(entry => {
      console.log(`✅ Creating event for date: ${entry.date}`);
      return {
        id: entry.date,
        title: '✓ Completed',
        date: entry.date,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        textColor: 'white',
        display: 'block'
      };
    });

    console.log('🎯 Final calendar events:', calendarEvents);
    setEvents(calendarEvents);
  };

  const handleDateClick = async (info: any) => {
    const clickedDate = info.dateStr;
    const today = startOfDay(new Date());
    const selectedDay = startOfDay(new Date(clickedDate));

    console.log(`📅 Date clicked: ${clickedDate}`);

    // Prevent future dates
    if (isAfter(selectedDay, today)) {
      toast.error('Cannot log symptoms for future dates');
      return;
    }

    // Only allow current month dates
    if (!isCurrentMonth(clickedDate)) {
      toast.error('Can only log symptoms for the current month');
      return;
    }

    setSelectedDate(clickedDate);
    
    // Check if entry already exists
    try {
      console.log(`🔍 Checking for existing entry on ${clickedDate}`);
      const entry = await getSymptomEntry(userId, clickedDate);
      console.log('📋 Existing entry found:', entry);
      setExistingEntry(entry);
    } catch (error) {
      console.error('Error getting existing entry:', error);
      setExistingEntry(null);
    }
    
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (entry: SymptomEntry) => {
    try {
      console.log('💾 Saving entry:', entry);
      
      // Save the symptom entry
      await saveSymptomEntry(userId, entry);
      
      // Get current month's entries to update progress
      const currentEntries = await getAllSymptomEntries(userId);
      console.log('📊 Current entries after save:', currentEntries);
      
      // Update progress with current month's data
      const currentMonthDates = currentEntries.map(e => e.date);
      const updatedProgress: UserProgress = {
        ...progress,
        completedDays: Math.min(currentMonthDates.length, 20),
        completedDates: currentMonthDates.slice(0, 20)
      };

      console.log('📈 Updating progress:', updatedProgress);
      await updateUserProgress(userId, updatedProgress);
      onProgressUpdate(updatedProgress);
      
      // Update local state
      setCurrentMonthEntries(currentEntries);
      
      toast.success(existingEntry ? 'Entry updated successfully!' : 'Entry saved successfully!');
      setIsModalOpen(false);
      setSelectedDate(null);
      setExistingEntry(null);
    } catch (error: any) {
      console.error('Error saving entry:', error);
      
      // Provide specific error messages
      if (error.message.includes('not authenticated')) {
        toast.error('Please sign in again to save your data');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('database')) {
        toast.error('Database error. Please contact support if this persists.');
      } else {
        toast.error(`Failed to save entry: ${error.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setExistingEntry(null);
  };

  const currentMonth = getCurrentMonthKey();
  const [year, month] = currentMonth.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Monthly Tracking - {monthName}:</strong> Click on any date in the current month to log your daily symptoms. 
          Completed days will be marked with a green checkmark. You can track up to 20 days per month.
        </p>
        <div className="mt-2 text-xs text-blue-600">
          📊 Current month entries: {currentMonthEntries.length} | 
          📅 Calendar events: {events.length} | 
          📈 Progress dates: {progress.completedDates.length}
        </div>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          events={events}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          height="auto"
          dayMaxEvents={true}
          moreLinkClick="popover"
          eventDisplay="block"
          dayCellClassNames={(info) => {
            const today = startOfDay(new Date());
            const cellDate = startOfDay(new Date(info.date));
            
            // Future dates
            if (isAfter(cellDate, today)) {
              return 'fc-day-future';
            }
            
            // Past month dates
            if (!isCurrentMonth(info.dateStr)) {
              return 'fc-day-past-month';
            }
            
            return '';
          }}
          validRange={{
            start: `${year}-${month}-01`,
            end: `${year}-${month}-31`
          }}
        />
      </div>

      {isModalOpen && selectedDate && (
        <SymptomModal
          date={selectedDate}
          existingEntry={existingEntry}
          onSave={handleSaveEntry}
          onClose={handleCloseModal}
        />
      )}

      <style jsx>{`
        .fc-day-future {
          background-color: #f3f4f6 !important;
          opacity: 0.5;
          cursor: not-allowed !important;
        }
        .fc-day-future:hover {
          background-color: #f3f4f6 !important;
        }
        .fc-day-past-month {
          background-color: #f9fafb !important;
          opacity: 0.3;
          cursor: not-allowed !important;
        }
        .fc-day-past-month:hover {
          background-color: #f9fafb !important;
        }
      `}</style>
    </div>
  );
};

export default Calendar;