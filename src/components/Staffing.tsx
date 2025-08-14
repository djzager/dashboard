import React, { useState, useEffect } from 'react'
import { fetchCurrentSchedule, getCurrentlyStaffed } from '../utils/api'
import { StaffedPosition, ScheduleResponse } from '../types/schedule'

interface StaffingProps {
  className?: string
}

const Staffing: React.FC<StaffingProps> = ({ className = '' }) => {
  const [scheduleData, setScheduleData] = useState<ScheduleResponse>([])
  const [staffedPositions, setStaffedPositions] = useState<StaffedPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScheduleData()
    const interval = setInterval(fetchScheduleData, 5 * 60 * 1000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchScheduleData = async () => {
    try {
      setError(null)
      const data = await fetchCurrentSchedule()
      console.log('Schedule data received:', data)
      setScheduleData(data)
      const staffed = getCurrentlyStaffed(data)
      console.log('Currently staffed positions:', staffed)
      setStaffedPositions(staffed)
    } catch (err) {
      setError('Failed to fetch schedule data')
      console.error('Error fetching schedule:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatTimeRange = (start: string, end: string): string => {
    return `${formatTime(start)} - ${formatTime(end)}`
  }

  if (loading && staffedPositions.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Staffing</h2>
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchScheduleData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Retry</span>
        </button>
      </div>
    )
  }

  // Group staffed positions by assignment
  const groupedStaffing = staffedPositions.reduce((groups, position) => {
    const key = position.assignmentName
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(position)
    return groups
  }, {} as Record<string, StaffedPosition[]>)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Current Staffing</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {staffedPositions.length} On Duty
          </div>
          <button 
            onClick={fetchScheduleData}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {staffedPositions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <div>No one currently on duty</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto space-y-4">
            {Object.entries(groupedStaffing).map(([assignmentName, positions]) => (
              <div key={assignmentName} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{assignmentName}</h3>
                <div className="space-y-2">
                  {positions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {position.user.public_name}
                            </div>
                            {position.positionName && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {position.positionName}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Until {formatTime(position.endTime)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeRange(position.startTime, position.endTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {position.user.email && (
                            <span>{position.user.email}</span>
                          )}
                          {position.user.phone && (
                            <span>{position.user.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Staffing