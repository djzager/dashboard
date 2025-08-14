export interface Dispatch {
  id: number
  type: string
  message: string | null
  place_name: string | null
  address: string
  address2: string | null
  cross_streets: string | null
  city: string
  state_code: string
  latitude: number
  longitude: number
  unit_codes: string[]
  incident_type_code: string
  status_code: 'open' | 'closed'
  xref_id: string
  created_at: string
  radio_channel: string | null
  alarm_level: string | null
  incident_number: string | null
  fire_zone: string | null
  fire_stations: string[]
}

export const getIncidentTypeColor = (incidentTypeCode: string): string => {
  // Fire-related incidents - red
  if (['FHOU', 'FVEH', 'FCOM', 'FWILD', 'FALM'].includes(incidentTypeCode)) {
    return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-500'
  }
  
  // Medical emergencies - blue
  if (['SICK', 'ABD', 'CHEST', 'DIFF', 'FALLS', 'UNCON', 'SEIZURE', 'BLEED', 'HEAD'].includes(incidentTypeCode)) {
    return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-500'
  }
  
  // Accidents/Trauma - orange
  if (['ACOD', 'ASLTI', 'MVA', 'TRAUMA'].includes(incidentTypeCode)) {
    return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-500'
  }
  
  // Mutual Aid - purple
  if (['MAFF', 'MAOE'].includes(incidentTypeCode)) {
    return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-500'
  }
  
  // Service calls - gray
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-500'
}

export const formatDispatchTime = (createdAt: string): string => {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m ago`
  } else {
    return `${diffMinutes}m ago`
  }
}