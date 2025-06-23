import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, isAfter, startOfDay } from 'date-fns';
import SymptomModal from './SymptomModal';
import { SymptomEntry, UserProgress } from '../types';
import { getSymptomEntry, saveSymptomEntry, updateUserProgress } from '../firebase/firestore';
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

  useEffect(() => {
    loadCalendarEvents();
  }, [progress.completedDates]);

  const loadCalendarEvents = () => {
    const calendarEvents = progress.completedDates.map(date => ({
      id: date,
      title: '✓ Completed',
      date: date,
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: 'white'
    }));
    setEvents(calendarEvents);
  };

  const handleDateClick = async (info: any) => {
    const clickedDate = info.dateStr;
    const today = startOfDay(new Date());
    const selectedDay = startOfDay(new Date(clickedDate));

    // Prevent future dates
    if (isAfter(selectedDay, today)) {
      toast.error('Cannot log symptoms for future dates');
      return;
    }

    setSelectedDate(clickedDate);
    
    // Check if entry already exists
    try {
      const entry = await getSymptomEntry(userId, clickedDate);
      setExistingEntry(entry);
    } catch (error) {
      setExistingEntry(null);
    }
    
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (entry: SymptomEntry) => {
    try {
      await saveSymptomEntry(userId, entry);
      
      // Update progress
      const updatedDates = existingEntry 
        ? progress.completedDates 
        : [...progress.completedDates, entry.date];
      
      const updatedProgress: UserProgress = {
        ...progress,
        completedDays: updatedDates.length,
        completedDates: updatedDates
      };

      await updateUserProgress(userId, updatedProgress);
      onProgressUpdate(updatedProgress);
      
      toast.success(existingEntry ? 'Entry updated successfully!' : 'Entry saved successfully!');
      setIsModalOpen(false);
      setSelectedDate(null);
      setExistingEntry(null);
    } catch (error) {
      toast.error('Error saving entry');
      console.error('Error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setExistingEntry(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Click on any date (except future dates) to log your daily symptoms. 
          Completed days will be marked with a green checkmark.
        </p>
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
            
            if (isAfter(cellDate, today)) {
              return 'fc-day-future';
            }
            return '';
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
      `}</style>
    </div>
  );
};

export default Calendar;