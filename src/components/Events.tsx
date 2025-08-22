import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import CalendarDrawer from './CalendarDrawer'

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

const EVENTS_CALENDAR_ID = 'events@reva16.org'
const RENTALS_CALENDAR_ID = 'hallrentals@reva16.org'

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

const Events: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCalendarDrawerOpen, setIsCalendarDrawerOpen] = useState(false)
  const { user, accessToken, requestCalendarAccess } = useAuth()

  const fetchEvents = useCallback(async () => {
    if (!accessToken) return

    try {
      const now = new Date()
      const twoWeeksFromNow = new Date()
      twoWeeksFromNow.setDate(now.getDate() + 14)

      const params = new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: twoWeeksFromNow.toISOString(),
        maxResults: '50',
        singleEvents: 'true',
        orderBy: 'startTime',
        fields: 'items(id,summary,start,end,colorId,description,location,status,transparency,visibility)'
      })

      // Fetch from both calendars in parallel
      const [eventsResponse, rentalsResponse] = await Promise.all([
        fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(EVENTS_CALENDAR_ID)}/events?${params}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        ),
        fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(RENTALS_CALENDAR_ID)}/events?${params}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      ])

      if (!eventsResponse.ok || !rentalsResponse.ok) {
        throw new Error(`HTTP error! Events: ${eventsResponse.status}, Rentals: ${rentalsResponse.status}`)
      }

      const [eventsData, rentalsData] = await Promise.all([
        eventsResponse.json(),
        rentalsResponse.json()
      ])

      console.log('Events API response:', eventsData)
      console.log('Rentals API response:', rentalsData)
      
      // Combine events from both calendars with source labels
      const eventsWithSource = (eventsData.items || []).map((event: any) => {
        console.log('Event item:', event)
        return {
          ...event,
          calendarSource: 'events' as const
        }
      })
      
      const rentalsWithSource = (rentalsData.items || []).map((event: any) => {
        console.log('Rental item:', event)
        return {
          ...event,
          calendarSource: 'rentals' as const
        }
      })

      const allEvents = [...eventsWithSource, ...rentalsWithSource]
        .sort((a, b) => {
          const aStart = new Date(a.start.dateTime || a.start.date)
          const bStart = new Date(b.start.dateTime || b.start.date)
          return aStart.getTime() - bStart.getTime()
        })

      setEvents(allEvents)
      setError(null)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setError('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    if (!accessToken) {
      setLoading(false)
      return
    }

    fetchEvents()
  }, [user, accessToken, fetchEvents])

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.start.dateTime || event.start.date
    const end = event.end.dateTime || event.end.date
    if (!start) return ''

    const startDate = new Date(start)
    const endDate = end ? new Date(end) : null
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

    let dateStr = ''
    if (eventDate.getTime() === today.getTime()) {
      dateStr = 'Today'
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      dateStr = 'Tomorrow'
    } else {
      dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    if (event.start.dateTime && event.end.dateTime && endDate) {
      const startTimeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      const endTimeStr = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return `${dateStr}, ${startTimeStr} - ${endTimeStr}`
    } else if (event.start.dateTime) {
      const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return `${dateStr}, ${timeStr}`
    } else {
      return `${dateStr} (All day)`
    }
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


  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-l-4 border-gray-300 pl-3">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
        <div className="text-gray-600 dark:text-gray-300">Please log in to view events</div>
      </div>
    )
  }

  if (!accessToken) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          Calendar access is required to view upcoming events.
        </div>
        <button
          onClick={requestCalendarAccess}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Grant Calendar Access
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
        <div className="text-gray-600 dark:text-gray-300 mb-4">{error}</div>
        <button
          onClick={requestCalendarAccess}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry Calendar Access
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Events</h2>
        <button
          onClick={() => setIsCalendarDrawerOpen(true)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
          title="Open Calendar View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">No upcoming events</div>
        ) : (
          events.map((event) => (
            <div key={event.id} className={`rounded-lg p-3 border-l-4 ${getEventColor(event)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{event.summary}</div>
                  <div className="text-sm opacity-80">{formatEventTime(event)}</div>
                </div>
                <div className="text-xs opacity-60 ml-2">
                  {event.calendarSource === 'rentals' ? 'Rental' : 'Event'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <CalendarDrawer
        isOpen={isCalendarDrawerOpen}
        onClose={() => setIsCalendarDrawerOpen(false)}
        events={events}
      />
    </div>
  )
}

export default Events