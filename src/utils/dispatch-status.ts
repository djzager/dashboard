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

// Status color mapping - easily configurable
export const STATUS_COLORS: Record<string, StatusColorConfig> = {
  'enroute': {
    className: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600',
    label: 'enroute'
  },
  'on_scene': {
    className: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
    label: 'on scene'
  },
  'arrived': {
    className: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
    label: 'on scene'
  },
  'transporting': {
    className: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600',
    label: 'transport'
  },
  'at_hospital': {
    className: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
    label: 'hospital'
  },
  'available': {
    className: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500',
    label: 'in service'
  },
  'dispatched': {
    className: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
    label: 'enroute'
  },
  'clear': {
    className: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500',
    label: 'in service'
  }
}

// Status patterns - case insensitive matching
const STATUS_PATTERNS: Record<string, RegExp[]> = {
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
  'available': [
    /available/i,
    /in service/i,
    /in serv/i,
    /clear.*scene/i
  ],
  'dispatched': [
    /dispatched/i,
    /assign/i,
    /assigned/i
  ],
  'clear': [
    /clear/i,
    /cleared/i,
    /clear alarms/i
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
  let statusLabel = statusText.trim()
  
  // Special cases: prioritize hospital location over generic status
  if (location && /hospital/i.test(location)) {
    // If at a hospital location, regardless of action (transporting, arrived, etc.)
    statusCategory = 'at_hospital'
  } else {
    // Normal pattern matching
    for (const [category, patterns] of Object.entries(STATUS_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(statusText)) {
          statusCategory = category
          break
        }
      }
      if (statusCategory !== 'unknown') break
    }
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