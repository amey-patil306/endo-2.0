import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, isAfter, startOfDay, isSameMonth } from 'date-fns';
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

  // Get current month and year
  const getCurrentMonth = (): Date => {
    return new Date();
  };

  // Check if date is in current month
  const isCurrentMonth = (dateString: string): boolean => {
    const date = new Date(dateString);
    const currentMonth = getCurrentMonth();
    return isSameMonth(date, currentMonth);
  };

  // Check if date is today or in the past (but not future)
  const isValidTrackingDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return date <= today;
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
    console.log(`📅 Date clicked: ${clickedDate}`);

    // Check if date is valid for tracking
    if (!isValidTrackingDate(clickedDate)) {
      toast.error('Cannot log symptoms for future dates');
      return;
    }

    // Only allow current month dates for new entries
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

  const currentMonth = getCurrentMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Monthly Tracking - {monthName}:</strong> Click on any date in the current month (up to today) to log your daily symptoms. 
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
            const cellDate = new Date(info.date);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            
            // Future dates (after today)
            if (cellDate > today) {
              return 'fc-day-future';
            }
            
            // Past month dates (not current month)
            if (!isSameMonth(cellDate, currentMonth)) {
              return 'fc-day-past-month';
            }
            
            // Current month, valid dates
            return 'fc-day-current-month';
          }}
          // Remove validRange to allow navigation between months
          // validRange={{
          //   start: `${year}-${month}-01`,
          //   end: `${year}-${month}-31`
          // }}
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
        /* Future dates - faded and not clickable */
        .fc-day-future {
          background-color: #f3f4f6 !important;
          opacity: 0.5;
          cursor: not-allowed !important;
        }
        .fc-day-future:hover {
          background-color: #f3f4f6 !important;
        }
        
        /* Past month dates - very faded and not clickable */
        .fc-day-past-month {
          background-color: #f9fafb !important;
          opacity: 0.3;
          cursor: not-allowed !important;
        }
        .fc-day-past-month:hover {
          background-color: #f9fafb !important;
        }
        
        /* Current month dates - normal appearance and clickable */
        .fc-day-current-month {
          background-color: white !important;
          opacity: 1;
          cursor: pointer !important;
        }
        .fc-day-current-month:hover {
          background-color: #f8fafc !important;
        }
        
        /* Override FullCalendar's default styles for current month */
        .fc-day-current-month .fc-daygrid-day-frame {
          cursor: pointer !important;
        }
        
        /* Ensure events are visible on current month dates */
        .fc-day-current-month .fc-event {
          opacity: 1 !important;
        }
        
        /* Make sure the calendar doesn't have global opacity issues */
        .calendar-container .fc {
          opacity: 1 !important;
        }
        
        .calendar-container .fc-view-harness {
          opacity: 1 !important;
        }
        
        .calendar-container .fc-daygrid {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default Calendar;