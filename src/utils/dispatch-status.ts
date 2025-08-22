// Utility functions for parsing dispatch comments and extracting unit statuses

export interface UnitStatus {
  unit: string;
  status: string;
  timestamp: string;
  location?: string;
}

export interface StatusColorConfig {
  className: string;
  label: string;
}

// Status color mapping - following PulsePoint unit status legend
export const STATUS_COLORS: Record<string, StatusColorConfig> = {
  'dispatched': {
    className: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600',
    label: 'Dispatched'
  },
  'acknowledged': {
    className: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600',
    label: 'Acknowledged'
  },
  'enroute': {
    className: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
    label: 'Enroute'
  },
  'on_scene': {
    className: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600',
    label: 'On Scene'
  },
  'arrived': {
    className: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600',
    label: 'On Scene'
  },
  'available_on_scene': {
    className: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600',
    label: 'On Scene'
  },
  'transporting': {
    className: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600',
    label: 'Transport'
  },
  'at_hospital': {
    className: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
    label: 'Arrived'
  },
  'clear': {
    className: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500',
    label: 'Cleared'
  },
  'available': {
    className: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500',
    label: 'Available'
  }
}

// Status patterns - case insensitive matching
const STATUS_PATTERNS: Record<string, RegExp[]> = {
  'dispatched': [
    /dispatched/i,
    /assign/i,
    /assigned/i
  ],
  'acknowledged': [
    /acknowledged/i,
    /ack/i,
    /received/i
  ],
  'enroute': [
    /enroute/i,
    /en route/i,
    /unit dispatched & enroute/i,
    /responding/i
  ],
  'on_scene': [
    /on scene/i,
    /arrived at.*location/i,
    /arrived on scene/i
  ],
  'arrived': [
    /arrived at/i,
    /arrived/i
  ],
  'available_on_scene': [
    /available.*scene/i,
    /on scene.*available/i
  ],
  'transporting': [
    /transporting/i,
    /transport/i,
    /enroute to hospital/i
  ],
  'at_hospital': [
    /arrived.*hospital/i,
    /at hospital/i,
    /hospital arrival/i,
    /transporting.*hospital/i,
    /location:.*hospital/i
  ],
  'clear': [
    /clear/i,
    /cleared/i,
    /clear alarms/i,
    /complete/i,
    /completed/i
  ],
  'available': [
    /available/i,
    /in service/i,
    /in serv/i
  ]
}

/**
 * Parse a single line from dispatch comments to extract unit status
 */
function parseDispatchLine(line: string): UnitStatus | null {
  // Expected format: "HH:MM:SS: UNIT, STATUS (optional location info)"
  const lineMatch = line.match(/^(\d{2}:\d{2}:\d{2}):\s*([A-Z0-9]+),?\s*(.+)$/i)
  
  if (!lineMatch) {
    return null
  }
  
  const [, timestamp, unit, statusText] = lineMatch
  
  // Extract location if present
  const locationMatch = statusText.match(/\(Location:\s*([^)]+)\)/i)
  const location = locationMatch ? locationMatch[1] : undefined
  
  // Determine status category based on patterns
  let statusCategory = 'unknown'
  
  // Normal pattern matching - check status text first
  for (const [category, patterns] of Object.entries(STATUS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(statusText)) {
        statusCategory = category
        break
      }
    }
    if (statusCategory !== 'unknown') break
  }
  
  // Special case: if we didn't find a status but location indicates hospital arrival
  if (statusCategory === 'unknown' && location && /hospital/i.test(location) && /arrived/i.test(statusText)) {
    statusCategory = 'at_hospital'
  }
  
  return {
    unit: unit.toUpperCase(),
    status: statusCategory,
    timestamp,
    location
  }
}

/**
 * Parse dispatch comments to extract latest status for each unit
 */
export function parseDispatchComments(dispatchComment: string, unitCodes: string[]): Map<string, UnitStatus> {
  const unitStatuses = new Map<string, UnitStatus>()
  
  if (!dispatchComment) {
    return unitStatuses
  }
  
  // Split into lines and process from most recent (first) to oldest
  const lines = dispatchComment.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const parsedStatus = parseDispatchLine(line)
    
    if (parsedStatus && unitCodes.includes(parsedStatus.unit)) {
      // Only update if we haven't seen this unit yet (since we're going chronologically backwards)
      if (!unitStatuses.has(parsedStatus.unit)) {
        unitStatuses.set(parsedStatus.unit, parsedStatus)
      }
    }
  }
  
  return unitStatuses
}

/**
 * Get status color configuration for a given status
 */
export function getStatusColor(status: string): StatusColorConfig {
  return STATUS_COLORS[status] || {
    className: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500',
    label: status
  }
}

/**
 * Get the latest status for a specific unit from parsed statuses
 */
export function getUnitLatestStatus(unit: string, unitStatuses: Map<string, UnitStatus>): UnitStatus | null {
  return unitStatuses.get(unit.toUpperCase()) || null
}

/**
 * Direct parsing of unit status from call notes - simple and reliable
 */
export interface UnitStatusResult {
  status: string;
  label: string;
  className: string;
  borderClass: string;
}

export function getUnitStatusFromCallNotes(unitCode: string, callNotes: string | null, isOurUnit: boolean, useRing: boolean = false): UnitStatusResult | null {
  if (!callNotes) return null;
  
  // Split lines and process from most recent (first) to oldest
  const lines = callNotes.split(/\\n|\n/).filter(line => line.trim());
  
  // Find first occurrence of this unit in the call notes
  for (const line of lines) {
    // Look for pattern: "HH:MM:SS: UNIT, STATUS..." 
    const match = line.match(/^\d{2}:\d{2}:\d{2}:\s*([A-Z0-9]+),?\s*(.+)$/i);
    if (match && match[1].toUpperCase() === unitCode.toUpperCase()) {
      const statusText = match[2].trim();
      
      // Determine status based on keywords in the status text
      if (/available/i.test(statusText)) {
        return { 
          status: 'available', 
          label: 'Available', 
          className: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200',
          borderClass: isOurUnit 
            ? useRing ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-500 dark:border-blue-400'
            : 'border-gray-300 dark:border-gray-500'
        };
      }
      if (/transporting/i.test(statusText)) {
        return { 
          status: 'transporting', 
          label: 'Transport', 
          className: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
          borderClass: isOurUnit 
            ? useRing ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-500 dark:border-blue-400'
            : 'border-yellow-300 dark:border-yellow-600'
        };
      }
      if (/on scene/i.test(statusText) || /arrived/i.test(statusText)) {
        return { 
          status: 'on_scene', 
          label: 'On Scene', 
          className: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
          borderClass: isOurUnit 
            ? useRing ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-500 dark:border-blue-400'
            : 'border-red-300 dark:border-red-600'
        };
      }
      if (/enroute/i.test(statusText) || /en route/i.test(statusText)) {
        return { 
          status: 'enroute', 
          label: 'Enroute', 
          className: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
          borderClass: isOurUnit 
            ? useRing ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-500 dark:border-blue-400'
            : 'border-green-300 dark:border-green-600'
        };
      }
      if (/dispatched/i.test(statusText)) {
        return { 
          status: 'dispatched', 
          label: 'Dispatched', 
          className: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200',
          borderClass: isOurUnit 
            ? useRing ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-500 dark:border-blue-400'
            : 'border-orange-300 dark:border-orange-600'
        };
      }
      if (/clear/i.test(statusText) || /complete/i.test(statusText)) {
        return { 
          status: 'clear', 
          label: 'Cleared', 
          className: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200',
          borderClass: isOurUnit 
            ? useRing ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-500 dark:border-blue-400'
            : 'border-gray-300 dark:border-gray-500'
        };
      }
      
      // Default for unrecognized status
      return { 
        status: 'unknown', 
        label: 'Active', 
        className: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
        borderClass: isOurUnit 
          ? useRing ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-500 dark:border-blue-400'
          : 'border-blue-300 dark:border-blue-600'
      };
    }
  }
  
  return null;
}