import React, { useState, useEffect } from 'react'
import { Apparatus, ApparatusWithStatus, ApparatusStatus as StatusType, getApparatusTypeColor, getStatusColor } from '../types/apparatus'
import { fetchApparatuses } from '../utils/api'

interface ApparatusStatusProps {
  className?: string
}

const ApparatusStatus: React.FC<ApparatusStatusProps> = ({ className = '' }) => {
  const [apparatuses, setApparatuses] = useState<ApparatusWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApparatusData()
    // No automatic polling - only via manual refresh button
  }, [])

  const fetchApparatusData = async () => {
    try {
      setError(null)
      const data = await fetchApparatuses()
      
      // Convert basic apparatus data to apparatus with status, preserving existing status if available
      const apparatusWithStatus = data.map(apparatus => {
        const existing = apparatuses.find(a => a.uuid === apparatus.uuid)
        return {
          ...apparatus,
          status: existing?.status || 'in_service' as StatusType,
          last_updated: existing?.last_updated || new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        }
      })
      
      setApparatuses(apparatusWithStatus)
    } catch (err) {
      setError('Failed to fetch apparatus data')
      console.error('Error fetching apparatus:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleApparatusStatus = (uuid: string) => {
    setApparatuses(prev => prev.map(apparatus => {
      if (apparatus.uuid === uuid) {
        const nextStatus: StatusType = apparatus.status === 'in_service' ? 'out_of_service' : 'in_service'
        
        return {
          ...apparatus,
          status: nextStatus,
          last_updated: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        }
      }
      return apparatus
    }))
  }

  const getStatusText = (status: StatusType): string => {
    switch (status) {
      case 'in_service':
        return 'In Service'
      case 'out_of_service':
        return 'Out of Service'
    }
  }

  const suppessionUnits = apparatuses.filter(app => app.use_code === '1')
  const emsUnits = apparatuses.filter(app => app.use_code === '2')
  const otherUnits = apparatuses.filter(app => app.use_code === '0')

  if (loading && apparatuses.length === 0) {
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
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Apparatus Status</h2>
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchApparatusData}
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

  const renderApparatusGroup = (title: string, units: ApparatusWithStatus[]) => {
    if (units.length === 0) return null
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {units.map((apparatus) => (
            <div
              key={apparatus.uuid}
              className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-center"
            >
              <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {apparatus.unit_code}
              </div>
              <button
                onClick={() => toggleApparatusStatus(apparatus.uuid)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-80 ${getStatusColor(apparatus.status)}`}
                title="Click to change status"
              >
                {getStatusText(apparatus.status)}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Apparatus Status</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {apparatuses.length} Units
          </div>
          <button 
            onClick={fetchApparatusData}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {apparatuses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No apparatus data available
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto space-y-4">
            {renderApparatusGroup('Fire', suppessionUnits)}
            {renderApparatusGroup('EMS', emsUnits)}
            {renderApparatusGroup('Other', otherUnits)}
          </div>
        </div>
      )}
    </div>
  )
}

export default ApparatusStatus