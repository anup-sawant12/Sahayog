import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react';
import WorkerCalendarBooking from './WorkerCalendarBooking';
import Button from '../common/Button';

// Safe date key normalizer (YYYY-MM-DD) avoiding timezone shifts
export const toDateKey = (dateInput) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    return dateInput.substring(0, 10);
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WorkerBookingCalendar = ({
  bookings = [],
  isLoading = false,
  error = null,
  onRetry = null,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const [currentMonthDate, setCurrentMonthDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  // Group bookings by normalized YYYY-MM-DD
  const bookingsByDate = useMemo(() => {
    const map = {};
    if (!Array.isArray(bookings)) return map;

    for (const b of bookings) {
      if (!b.scheduledDate) continue;
      const key = toDateKey(b.scheduledDate);
      if (!key) continue;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(b);
    }

    // Sort bookings on each date by scheduledTime
    for (const key in map) {
      map[key].sort((a, b) => {
        const timeA = a.scheduledTime || '';
        const timeB = b.scheduledTime || '';
        return timeA.localeCompare(timeB);
      });
    }

    return map;
  }, [bookings]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(todayKey);
  };

  // Build calendar matrix (Monday-indexed: 0=Mon, 6=Sun)
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const mondayOffset = (firstDayIndex + 6) % 7; // Monday becomes 0

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // 1. Previous month trailing days
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const dateKey = toDateKey(d);
      days.push({
        dayNumber: dayNum,
        dateKey,
        isCurrentMonth: false,
        dateObj: d,
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dateKey = toDateKey(d);
      days.push({
        dayNumber: dayNum,
        dateKey,
        isCurrentMonth: true,
        dateObj: d,
      });
    }

    // 3. Next month leading days (fill row to multiple of 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      const dateKey = toDateKey(d);
      days.push({
        dayNumber: dayNum,
        dateKey,
        isCurrentMonth: false,
        dateObj: d,
      });
    }

    return days;
  }, [year, month]);

  // Selected date bookings
  const selectedBookings = useMemo(() => {
    return bookingsByDate[selectedDateKey] || [];
  }, [bookingsByDate, selectedDateKey]);

  // Format selected date for display
  const selectedFormattedDate = useMemo(() => {
    if (!selectedDateKey) return '';
    try {
      const [y, m, d] = selectedDateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDateKey;
    }
  }, [selectedDateKey]);

  // Status dot color helper
  const getStatusDotColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return '#10b981'; // vibrant green
      case 'PENDING':
        return '#f59e0b'; // amber
      case 'COMPLETED':
        return '#0d9488'; // teal
      case 'CANCELLED':
      case 'REJECTED':
      default:
        return '#94a3b8'; // muted slate
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '28px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        marginBottom: '32px',
        textAlign: 'left',
      }}
    >
      {/* Calendar Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck size={22} color="#0d9488" />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Job Schedule & Calendar
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Interactive monthly view of your customer bookings and scheduled appointments
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            size="small"
            onClick={handleToday}
            style={{ fontWeight: 600, fontSize: '13px', padding: '6px 14px' }}
          >
            Today
          </Button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={18} />
            </button>

            <span
              style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#0f172a',
                padding: '0 12px',
                minWidth: '140px',
                textAlign: 'center',
              }}
            >
              {MONTH_NAMES[month]} {year}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error ? (
        <div
          style={{
            padding: '36px',
            textAlign: 'center',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            color: '#991b1b',
          }}
        >
          <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '16px' }}>
            Couldn&apos;t load your bookings
          </p>
          <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#b91c1c' }}>
            {error || 'Please check your connection and try again.'}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="small"
              onClick={onRetry}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff' }}
            >
              <RefreshCw size={14} /> Try Again
            </Button>
          )}
        </div>
      ) : (
        /* Asymmetric Two-Column Layout: Calendar Grid + Selected Date Side Panel */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* Column 1: Monthly Calendar Grid */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            {/* Weekday Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                textAlign: 'center',
                marginBottom: '10px',
              }}
            >
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#64748b',
                    padding: '6px 0',
                    letterSpacing: '0.04em',
                  }}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            {isLoading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '6px',
                }}
              >
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '62px',
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #f1f5f9',
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '6px',
                }}
              >
                {calendarDays.map((cell) => {
                  const dayBookings = bookingsByDate[cell.dateKey] || [];
                  const count = dayBookings.length;
                  const isSelected = selectedDateKey === cell.dateKey;
                  const isToday = todayKey === cell.dateKey;

                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      onClick={() => {
                        setSelectedDateKey(cell.dateKey);
                        if (!cell.isCurrentMonth) {
                          setCurrentMonthDate(
                            new Date(cell.dateObj.getFullYear(), cell.dateObj.getMonth(), 1)
                          );
                        }
                      }}
                      style={{
                        height: '66px',
                        background: isSelected
                          ? '#f0fdfa'
                          : cell.isCurrentMonth
                          ? '#ffffff'
                          : '#f1f5f9',
                        border: isSelected
                          ? '2px solid #0d9488'
                          : isToday
                          ? '2px solid #3b82f6'
                          : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '6px 5px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 8px rgba(13, 148, 136, 0.15)' : 'none',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#0d9488';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = isToday ? '#3b82f6' : '#e2e8f0';
                        }
                      }}
                    >
                      {/* Day Number + Today Tag */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: isSelected || isToday ? 800 : 600,
                            color: isSelected
                              ? '#0f766e'
                              : isToday
                              ? '#1d4ed8'
                              : cell.isCurrentMonth
                              ? '#1e293b'
                              : '#94a3b8',
                          }}
                        >
                          {cell.dayNumber}
                        </span>

                        {isToday && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '-2px',
                              right: '0',
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: '#2563eb',
                            }}
                          />
                        )}
                      </div>

                      {/* Booking indicators & Count badge */}
                      {count > 0 ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            gap: '2px',
                          }}
                        >
                          {/* Colored status dots */}
                          <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                            {dayBookings.slice(0, 3).map((b, idx) => (
                              <span
                                key={idx}
                                style={{
                                  width: '5.5px',
                                  height: '5.5px',
                                  borderRadius: '50%',
                                  background: getStatusDotColor(b.status),
                                }}
                              />
                            ))}
                          </div>

                          {/* Compact job count */}
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: isSelected ? '#0d9488' : '#475569',
                              lineHeight: 1.1,
                            }}
                          >
                            {count === 1 ? '1 job' : `${count} jobs`}
                          </span>
                        </div>
                      ) : (
                        <div style={{ height: '14px' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                fontSize: '12px',
                color: '#64748b',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                Confirmed
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                Pending
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d9488' }} />
                Completed
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', border: '1.5px solid #3b82f6' }} />
                Today
              </div>
            </div>
          </div>

          {/* Column 2: Selected Date Bookings Side Panel */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '400px',
            }}
          >
            {/* Panel Header */}
            <div
              style={{
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0d9488' }}>
                {selectedDateKey === todayKey ? "Today's Agenda" : 'Schedule For'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {selectedFormattedDate}
              </h3>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {selectedBookings.length === 0
                  ? 'No bookings scheduled'
                  : selectedBookings.length === 1
                  ? '1 booking scheduled'
                  : `${selectedBookings.length} bookings scheduled`}
              </span>
            </div>

            {/* List of Bookings on Selected Date */}
            {isLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '13.5px' }}>Loading schedule...</div>
              </div>
            ) : selectedBookings.length === 0 ? (
              <div
                style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                  margin: 'auto 0',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <CalendarDays size={24} color="#94a3b8" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>
                  No bookings scheduled
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                  This day is currently free.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedBookings.map((b) => (
                  <WorkerCalendarBooking key={b.id} booking={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerBookingCalendar;
