import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from './Icons';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const CalendarWidget = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      days.push(
        <div
          className={`
            p-2 cursor-pointer text-center text-sm rounded-lg transition-colors
            ${!isSameMonth(day, monthStart)
              ? "text-gray-300"
              : isSameDay(day, selectedDate || new Date())
              ? "bg-indigo-600 text-white"
              : isSameDay(day, new Date())
              ? "bg-indigo-100 text-indigo-600 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
            }
          `}
          key={day}
          onClick={() => onDateSelect?.(cloneDay)}
        >
          <span>{formattedDate}</span>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[250px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="p-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1 overflow-auto flex-1">
        {rows}
      </div>
    </div>
  );
//   
};

export default CalendarWidget;