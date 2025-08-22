import { useEffect } from 'react'

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  colorId?: string
  backgroundColor?: string
  calendarSource?: 'events' | 'rentals'
}

interface CalendarDrawerProps {
  isOpen: boolean
  onClose: () => void
  events: CalendarEvent[]
}

// Google Calendar color mapping to Tailwind classes
const colorMap: Record<string, string> = {
  '1': 'bg-blue-100 text-blue-800 border-blue-500',      // Lavender
  '2': 'bg-green-100 text-green-800 border-green-500',   // Sage
  '3': 'bg-purple-100 text-purple-800 border-purple-500', // Grape
  '4': 'bg-red-100 text-red-800 border-red-500',         // Flamingo
  '5': 'bg-yellow-100 text-yellow-800 border-yellow-500', // Banana
  '6': 'bg-orange-100 text-orange-800 border-orange-500', // Tangerine
  '7': 'bg-cyan-100 text-cyan-800 border-cyan-500',      // Peacock
  '8': 'bg-gray-100 text-gray-800 border-gray-500',      // Graphite
  '9': 'bg-blue-200 text-blue-900 border-blue-600',      // Blueberry
  '10': 'bg-green-200 text-green-900 border-green-600',  // Basil
  '11': 'bg-red-200 text-red-900 border-red-600',        // Tomato
}

const CalendarDrawer: React.FC<CalendarDrawerProps> = ({ isOpen, onClose, events }) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  const generateCalendarDays = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1)
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the day of week for first day (0 = Sunday)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Generate 6 weeks (42 days) to fill the calendar grid
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    
    return days
  }

  const getMonthYear = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const startTime = event.start.dateTime || event.start.date
      if (!startTime) return false
      const eventDate = new Date(startTime)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  const isCurrentMonth = (date: Date) => {
    const today = new Date()
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getEventColor = (event: CalendarEvent) => {
    if (event.colorId) {
      return colorMap[event.colorId] || 'bg-blue-100 text-blue-800 border-blue-500'
    }
    // Default colors by calendar source
    if (event.calendarSource === 'rentals') {
      return 'bg-purple-100 text-purple-800 border-purple-500'
    }
    return 'bg-blue-100 text-blue-800 border-blue-500'
  }

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.start.dateTime || event.start.date
    if (!start) return ''

    const date = new Date(start)
    if (event.start.dateTime) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else {
      return 'All day'
    }
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-4xl">
          <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-normal text-gray-900 dark:text-white">
                    {getMonthYear()}
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="flex-1 bg-white dark:bg-gray-800">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div key={day} className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
                {calendarDays.map((date, index) => {
                  const dayEvents = getEventsForDate(date)
                  const isTodayDate = isToday(date)
                  const isCurrentMonthDate = isCurrentMonth(date)
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-24 border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 p-1 ${
                        !isCurrentMonthDate ? 'bg-gray-50 dark:bg-gray-900' : ''
                      }`}
                    >
                      {/* Date number */}
                      <div className="flex justify-start mb-1">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          isTodayDate 
                            ? 'bg-blue-600 text-white' 
                            : isCurrentMonthDate
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>
                          {date.getDate()}
                        </span>
                      </div>
                      
                      {/* Events */}
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div 
                            key={event.id} 
                            className={`px-2 py-1 rounded text-xs truncate border-l-2 ${getEventColor(event)}`}
                            title={`${event.summary} - ${formatEventTime(event)}`}
                          >
                            <span className="font-medium">
                              {formatEventTime(event)} {event.summary}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarDrawer