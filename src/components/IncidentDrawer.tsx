import React, { useState, useEffect } from 'react'
import { Incident } from '../types/incident'
import { isOurUnit } from '../utils/api'
import { parseDispatchComments, getStatusColor, getUnitLatestStatus } from '../utils/dispatch-status'

interface IncidentDrawerProps {
  incident: Incident | null
  isOpen: boolean
  onClose: () => void
  isNewDispatch?: boolean // For special styling/behavior for brand new dispatches
}

const IncidentDrawer: React.FC<IncidentDrawerProps> = ({ 
  incident, 
  isOpen, 
  onClose, 
  isNewDispatch = false 
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Timer to track time since dispatch (for all open dispatches)
  useEffect(() => {
    if (!isOpen || !incident || incident.dispatch.status_code !== 'open') return

    const startTime = new Date(incident.dispatch.created_at).getTime()
    
    const updateTimer = () => {
      const now = new Date().getTime()
      const elapsed = Math.floor((now - startTime) / 1000) // in seconds
      setTimeElapsed(elapsed)
    }

    // Update immediately
    updateTimer()
    
    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [isOpen, incident])

  // Auto-close after 10 minutes for new dispatches
  useEffect(() => {
    if (!isOpen || !incident || !isNewDispatch) return

    const autoCloseTimer = setTimeout(() => {
      onClose()
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearTimeout(autoCloseTimer)
  }, [isOpen, incident, isNewDispatch, onClose])

  // Format time elapsed
  const formatTimeElapsed = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Format standard time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!incident) return null

  const { dispatch, fireIncident, unitDispatch } = incident
  const isOurUnitInvolved = isOurUnit(dispatch.unit_codes)
  
  // Parse dispatch comments to get unit statuses (only for open dispatches)
  const unitStatuses = dispatch.status_code === 'open' && fireIncident?.dispatch_comment
    ? parseDispatchComments(fireIncident.dispatch_comment, dispatch.unit_codes)
    : new Map()

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-600 ${
          isNewDispatch ? 'bg-red-50 dark:bg-red-900/20' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isNewDispatch && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                  <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isNewDispatch ? '🚨 New Emergency Dispatch' : 'Incident Details'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dispatch.type}
                </p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Timer for open dispatches - centered and prominent */}
          {dispatch.status_code === 'open' && (
            <div className="text-center py-4">
              <div className={`text-5xl font-mono font-bold ${
                timeElapsed < 600 // Less than 10 minutes (600 seconds)
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {formatTimeElapsed(timeElapsed)}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {dispatch.type}
                </h3>
                {isOurUnitInvolved && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                    OUR UNITS
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  dispatch.status_code === 'open' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}>
                  {dispatch.status_code.toUpperCase()}
                </span>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-medium">{dispatch.address}</div>
                      {dispatch.address2 && <div>{dispatch.address2}</div>}
                      <div>{dispatch.city}, {dispatch.state_code}</div>
                      {dispatch.cross_streets && (
                        <div className="text-xs mt-1">Near: {dispatch.cross_streets}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Incident Info</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Dispatch ID: {dispatch.id}</div>
                      {fireIncident?.incident_number && (
                        <div>Incident: {fireIncident.incident_number}</div>
                      )}
                      <div>Type: {dispatch.incident_type_code}</div>
                      {dispatch.alarm_level && <div>Alarm: {dispatch.alarm_level}</div>}
                      <div>Created: {formatTime(dispatch.created_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Responding Units */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Responding Units</h4>
              <div className="flex flex-wrap gap-2">
                {dispatch.unit_codes.map((unit) => {
                  const latestStatus = getUnitLatestStatus(unit, unitStatuses);
                  const statusColor = latestStatus ? getStatusColor(latestStatus.status) : null;
                  const isOur = isOurUnit([unit]);
                  
                  return (
                    <div key={unit} className="flex flex-col items-center">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium border ${
                          isOur
                            ? statusColor 
                              ? `${statusColor.className} border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800`
                              : "bg-blue-500 text-white border-blue-600"
                            : statusColor
                              ? statusColor.className
                              : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {unit}
                      </span>
                      {latestStatus && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                          <div>{statusColor?.label || latestStatus.status}</div>
                          <div>{latestStatus.timestamp}</div>
                          {latestStatus.location && (
                            <div className="truncate max-w-20" title={latestStatus.location}>
                              {latestStatus.location}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unit Status Information */}
            {unitDispatch && unitDispatch.units && unitDispatch.units.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Responder Status</h4>
                <div className="space-y-3">
                  {unitDispatch.units.map((unit) => {
                    const latestStatus = unit.statuses && unit.statuses.length > 0
                      ? [...unit.statuses].sort((a, b) => 
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        )[0]
                      : null;
                    
                    return (
                      <div key={unit.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{unit.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{unit.email}</div>
                          </div>
                          {latestStatus && (
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                latestStatus.status_code === 'on_scene' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                                latestStatus.status_code === 'enroute' || latestStatus.status_code === 'responding' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                                latestStatus.status_code === 'complete' || latestStatus.status_code === 'cancel' ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200' :
                                'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                              }`}>
                                {latestStatus.name}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatTime(latestStatus.created_at)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message/Details */}
            {dispatch.message && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  {dispatch.message}
                </div>
              </div>
            )}

            {/* Dispatch Comments Timeline */}
            {fireIncident?.dispatch_comment && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Dispatch Timeline</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-2 text-sm font-mono text-gray-600 dark:text-gray-400">
                    {fireIncident.dispatch_comment
                      .split('\n')
                      .map((line, index) => (
                        <div key={index} className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                          {line}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer for new dispatches */}
        {isNewDispatch && (
          <div className="border-t border-gray-200 dark:border-gray-600 px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                This alert will auto-dismiss in 10 minutes
              </div>
              <div className="space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Dismiss
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IncidentDrawer