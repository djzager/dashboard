import { Dispatch } from '../types/dispatch'
import { Apparatus, ApparatusApiResponse, ApparatusWithStatus } from '../types/apparatus'
import { FireIncident } from '../types/fire-incident'
import { Incident, IncidentPage } from '../types/incident'
import { UnitDispatch } from '../types/unit-dispatch'
import { ScheduleResponse, StaffedPosition } from '../types/schedule'

// Use proxy server to avoid CORS issues
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001'

// Check if we should use mock data based on environment variable
const shouldUseMockData = (): boolean => {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true'
}

// Runtime dispatch storage (persists until page reload)
let runtimeDispatches: Dispatch[] = []
let runtimeFireIncidents: Map<string, FireIncident> = new Map()
let runtimeUnitDispatches: Map<number, UnitDispatch> = new Map()

// Runtime dispatch management functions
export const addRuntimeDispatch = (dispatch: Dispatch, fireIncident?: FireIncident, unitDispatch?: UnitDispatch) => {
  // Remove any existing dispatch with the same ID
  runtimeDispatches = runtimeDispatches.filter(d => d.id !== dispatch.id)
  
  // Add the new dispatch
  runtimeDispatches.unshift(dispatch) // Add to beginning
  
  if (fireIncident) {
    runtimeFireIncidents.set(dispatch.xref_id, fireIncident)
  }
  
  if (unitDispatch) {
    runtimeUnitDispatches.set(dispatch.id, unitDispatch)
  }
  
  console.log(`Added runtime dispatch: ${dispatch.id} (${dispatch.type})`)
}

export const removeRuntimeDispatch = (dispatchId: number) => {
  const dispatch = runtimeDispatches.find(d => d.id === dispatchId)
  if (dispatch) {
    runtimeDispatches = runtimeDispatches.filter(d => d.id !== dispatchId)
    runtimeFireIncidents.delete(dispatch.xref_id)
    runtimeUnitDispatches.delete(dispatchId)
    console.log(`Removed runtime dispatch: ${dispatchId}`)
  }
}

export const clearAllRuntimeDispatches = () => {
  runtimeDispatches = []
  runtimeFireIncidents.clear()
  runtimeUnitDispatches.clear()
  console.log('Cleared all runtime dispatches')
}

export const getRuntimeDispatches = () => runtimeDispatches

export interface FetchDispatchesResult {
  dispatches: Dispatch[]
  nextPageUrl?: string
  hasMore: boolean
}

export const fetchDispatchPage = async (url?: string, since?: string): Promise<FetchDispatchesResult> => {
  // Use mock data if environment variable is set
  if (shouldUseMockData()) {
    console.log('Using mock data (VITE_USE_MOCK_DATA=true)')
    return { dispatches: getMockData(), hasMore: false }
  }

  try {
    let requestUrl = url || `${PROXY_URL}/api/dispatches`
    if (!url && since) {
      requestUrl += `?since=${encodeURIComponent(since)}`
    }

    console.log('Fetching from URL:', requestUrl)
    const response = await fetch(requestUrl, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    let pageDispatches: Dispatch[] = []
    if (Array.isArray(data)) {
      pageDispatches = data as Dispatch[]
    } else if (data.data && Array.isArray(data.data)) {
      pageDispatches = data.data as Dispatch[]
    } else {
      console.warn('Unexpected API response format:', data)
      pageDispatches = []
    }
  
    // Extract Link header for pagination
    const linkHeader = response.headers.get('link')
    let nextUrl: string | undefined = undefined
    if (linkHeader) {
      // Parse Link header to find next page URL
      const links = linkHeader.split(',')
      for (const link of links) {
        const match = link.match(/<([^>]+)>;\s*rel="next"/)
        if (match) {
          nextUrl = match[1]
          break
        }
      }
    }
    
    // Convert FirstDue URL to proxy URL
    const nextPageUrl = nextUrl ? nextUrl.replace('https://sizeup.firstduesizeup.com/fd-api/v1', `${PROXY_URL}/api`) : undefined
    
    console.log(`Fetched ${pageDispatches.length} dispatches, hasMore: ${!!nextPageUrl}`)
    return {
      dispatches: pageDispatches,
      nextPageUrl,
      hasMore: !!nextPageUrl
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error occurred while fetching dispatches')
  }
}

// Legacy function for backward compatibility - now fetches all pages
export const fetchDispatches = async (since?: string): Promise<Dispatch[]> => {
  try {
    let allDispatches: Dispatch[] = []
    let nextPageUrl: string | undefined

    do {
      const result = await fetchDispatchPage(nextPageUrl, since)
      allDispatches.push(...result.dispatches)
      nextPageUrl = result.nextPageUrl
    } while (nextPageUrl)
    
    console.log(`Fetched ${allDispatches.length} total dispatches`)
    return allDispatches
  } catch (error) {
    throw new Error('Failed to fetch dispatches')
  }
}

// Station 16 unit codes
export const STATION_16_UNITS = [
  'ES16', 'A16', 'B16', 'CAR16', 'CMD16', 'MCU16', 'M16', 
  'RE16', 'RP16', 'SERV16', 'ST16', 'K16', 'UT16', 'W16', 'FS16'
]

// Helper function to check if dispatch involves our units
export const isOurUnit = (unitCodes: string[]): boolean => {
  return unitCodes.some(code => STATION_16_UNITS.includes(code))
}

export const fetchApparatuses = async (): Promise<Apparatus[]> => {
  // Use mock data if environment variable is set
  if (shouldUseMockData()) {
    return getMockApparatusData()
  }

  try {
    const response = await fetch(
      `${PROXY_URL}/api/apparatuses`,
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data: ApparatusApiResponse = await response.json()
    
    return data.list
  } catch (error) {
    console.error('Failed to fetch apparatus data:', error)
    throw error
  }
}

const getMockApparatusData = (): ApparatusWithStatus[] => {
  return [
    {
      uuid: "53db3b39-59bf-4894-8dac-38ab9e5beaa5",
      name: "Ambulance 16",
      unit_code: "A16",
      use_code: "2",
     use_name: "EMS",
      status: "in_service",
      location: "Station 16",
      last_updated: "2:30 PM"
    },
    {
      uuid: "2418562d-e71e-4e17-a238-566a14c5a03f",
      name: "Rescue Engine 16",
      unit_code: "RE16",
      use_code: "1",
      use_name: "Suppression",
      status: "responding",
      location: "En Route",
      last_updated: "2:25 PM"
    },
    {
      uuid: "c810a62b-d28b-4a70-a96a-eb0cdb4d1514",
      name: "Tanker 16",
      unit_code: "K16",
      use_code: "1",
      use_name: "Suppression",
      status: "out_of_service",
      location: "Maintenance",
      last_updated: "1:45 PM"
    },
    {
      uuid: "1f4ccc16-e00a-4e98-82c7-646799afbd25",
      name: "Medic 16",
      unit_code: "M16",
      use_code: "2",
      use_name: "EMS",
      status: "in_service",
      location: "Station 16",
      last_updated: "2:30 PM"
    }
  ]
}

export const fetchFireIncident = async (xrefId: string): Promise<FireIncident | null> => {
  // Use mock data if environment variable is set
  if (shouldUseMockData()) {
    return getMockFireIncident(xrefId)
  }

  try {
    const response = await fetch(
      `${PROXY_URL}/api/fire-incidents?incident_number=${xrefId}`,
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      if (response.status === 404) {
        // Incident not found, which is normal for some dispatch types
        return null
      }
      if (response.status === 422) {
        // Unprocessable entity - likely invalid xref_id format or non-fire incident
        return null
      }
      console.warn(`Fire incident API error for ${xrefId}: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    
    // Extract first incident from the response
    if (data.fire_incidents && data.fire_incidents.length > 0) {
      const incident = data.fire_incidents[0]
      // Return the incident data as-is from FirstDue API
      const fireIncident: FireIncident = {
        incident_number: incident.incident_number,
        status_code: incident.status_code,
        actual_incident_type: incident.actual_incident_type,
        aid_type: incident.aid_type,
        alarm_at: incident.alarm_at,
        created_at: incident.created_at,
        updated_at: incident.updated_at,
        dispatch_type_code: incident.dispatch_type_code,
        dispatch_comment: incident.dispatch_comment,
        dispatch_notified_at: incident.dispatch_notified_at,
        alarms: incident.alarms,
        water_on_fire_at: incident.water_on_fire_at,
        rit_established_at: incident.rit_established_at,
        rehab_established_discontinued_at: incident.rehab_established_discontinued_at,
        control_utility_at: incident.control_utility_at,
        command_established_at: incident.command_established_at,
        primary_search_complete_at: incident.primary_search_complete_at,
        loss_stopped_at: incident.loss_stopped_at,
        action_takens: incident.action_takens,
        property_loss: incident.property_loss,
        contents_loss: incident.contents_loss,
        pre_incident_property_value: incident.pre_incident_property_value,
        pre_incident_contents_value: incident.pre_incident_contents_value,
        department_narratives: incident.department_narratives,
        latitude: incident.latitude,
        longitude: incident.longitude,
        address: incident.address,
        suite: incident.suite,
        city: incident.city,
        state: incident.state,
        zip_code: incident.zip_code,
        first_due: incident.first_due,
        battalion: incident.battalion,
        response_zone: incident.response_zone,
        apparatuses: incident.apparatuses
      }
      
      return fireIncident
    }
    
    return null
  } catch (error) {
    console.error('Failed to fetch fire incident:', error)
    return null
  }
}

export const fetchUnitsByDispatch = async (dispatchId: number): Promise<UnitDispatch | null> => {
  // Use mock data if environment variable is set
  if (shouldUseMockData()) {
    return getMockUnitDispatch(dispatchId)
  }

  try {
    const response = await fetch(
      `${PROXY_URL}/api/get-units-by-dispatches?dispatch_id=${dispatchId}`,
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      if (response.status === 404) {
        // Unit data not found, which is normal for some dispatch types
        return null
      }
      if (response.status === 422) {
        // Unprocessable entity - likely invalid dispatch_id format
        return null
      }
      console.warn(`Unit dispatch API error for ${dispatchId}: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    
    // API returns array directly, get first element
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as UnitDispatch
    }
    
    return null
  } catch (error) {
    console.error('Failed to fetch unit dispatch:', error)
    return null
  }
}

export const getIncidentPage = async (url?: string, since?: string): Promise<IncidentPage> => {
  try {
    const result = await fetchDispatchPage(url, since)
    
    // Fetch fire incident and unit data only for open dispatches
    const incidents = await Promise.all(
      result.dispatches.map(async (dispatch) => {
        if (dispatch.status_code === 'open') {
          const [fireIncident, unitDispatch] = await Promise.all([
            fetchFireIncident(dispatch.xref_id),
            fetchUnitsByDispatch(dispatch.id)
          ])
          return {
            dispatch,
            fireIncident: fireIncident || undefined,
            unitDispatch: unitDispatch || undefined
          }
        } else {
          return {
            dispatch,
            fireIncident: undefined,
            unitDispatch: undefined
          }
        }
      })
    )
    
    return {
      incidents,
      nextPageUrl: result.nextPageUrl,
      hasMore: result.hasMore
    }
  } catch (error) {
    console.error('Failed to fetch incident page:', error)
    return { incidents: [], hasMore: false }
  }
}

// Legacy function for backward compatibility
export const getIncidents = async (since?: string): Promise<Incident[]> => {
  try {
    const dispatches = await fetchDispatches(since)
    
    // Fetch fire incident and unit data only for open dispatches
    const incidents = await Promise.all(
      dispatches.map(async (dispatch) => {
        if (dispatch.status_code === 'open') {
          const [fireIncident, unitDispatch] = await Promise.all([
            fetchFireIncident(dispatch.xref_id),
            fetchUnitsByDispatch(dispatch.id)
          ])
          return {
            dispatch,
            fireIncident: fireIncident || undefined,
            unitDispatch: unitDispatch || undefined
          }
        } else {
          return {
            dispatch,
            fireIncident: undefined,
            unitDispatch: undefined
          }
        }
      })
    )
    
    return incidents
  } catch (error) {
    console.error('Failed to fetch incidents:', error)
    return []
  }
}

const getMockData = (): Dispatch[] => {
  // Combine runtime dispatches with static mock data
  const staticMockData = [
    // 1) Open + our units (Station 16)
    {
      id: 39330236,
      type: "STRUCTURE FIRE",
      message: "Multi-story residential fire with possible entrapment. Heavy smoke visible from street. Multiple units responding.",
      place_name: "Reva Village Apartments",
      address: "123 MAIN ST",
      address2: "Apt 4B",
      cross_streets: "ELM ST (0.1 miles) and OAK AVE (0.2 miles)",
      city: "CULPEPER",
      state_code: "VA",
      latitude: 38.473689,
      longitude: -78.024778,
      unit_codes: ["RE16", "A16", "K16", "CMD16", "E01", "L01"], // Our units first
      incident_type_code: "FHOU",
      status_code: "open",
      xref_id: "CFS2575999",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      radio_channel: "FIRE-TAC-1",
      alarm_level: "2nd Alarm",
      incident_number: "24-5999",
      fire_zone: "Station 16 District",
      fire_stations: ["Station 16", "Station 01"]
    },
    // 2) Open + not our units
    {
      id: 39330237,
      type: "MEDICAL EMERGENCY",
      message: "Elderly male, chest pain, conscious and breathing. EMS en route.",
      place_name: null,
      address: "456 JEFFERSON AVE",
      address2: null,
      cross_streets: "WASHINGTON ST (0.2 miles) and MADISON DR (0.3 miles)",
      city: "CULPEPER",
      state_code: "VA",
      latitude: 38.475123,
      longitude: -78.018456,
      unit_codes: ["E03", "A05", "M07"], // No Station 16 units
      incident_type_code: "CHEST",
      status_code: "open",
      xref_id: "CFS2576001", 
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      radio_channel: "EMS-TAC-2",
      alarm_level: "1st Alarm",
      incident_number: "24-6001",
      fire_zone: "Station 03 District",
      fire_stations: ["Station 03", "Station 05"]
    },
    // 3) Closed
    {
      id: 39330235,
      type: "MOTOR VEHICLE ACCIDENT",
      message: null, // No message for closed calls
      place_name: null,
      address: "680 HUNTERS RD",
      address2: null,
      cross_streets: "PELHAMS REACH DR (0.1 miles) and WHITWORTH DR (0.1 miles)",
      city: "CULPEPER",
      state_code: "VA",
      latitude: 38.480689,
      longitude: -78.014778,
      unit_codes: ["A16", "E12", "PD50"], // Had our units but now closed
      incident_type_code: "MVA",
      status_code: "closed",
      xref_id: "CFS2575873",
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      radio_channel: "FIRE-TAC-2",
      alarm_level: "1st Alarm", 
      incident_number: "24-5873",
      fire_zone: "Station 16 District",
      fire_stations: ["Station 16", "Station 12"]
    }
  ]
  
  // Return runtime dispatches first, then static mock data
  return [...runtimeDispatches, ...staticMockData]
}

const getMockFireIncident = (xrefId: string): FireIncident => {
  // Check runtime fire incidents first
  if (runtimeFireIncidents.has(xrefId)) {
    return runtimeFireIncidents.get(xrefId)!
  }
  
  // Return different mock data based on specific xref_ids
  
  if (xrefId.includes('2575999')) {
    // Structure fire with our units - detailed fire incident data
    return {
      incident_number: xrefId,
      status_code: 'active',
      actual_incident_type: 'Structure Fire',
      aid_type: 'mutual_aid',
      alarm_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      dispatch_type_code: 'FHOU',
      dispatch_comment: `11:34:15: RE16, ON SCENE\n11:32:45: A16, ENROUTE\n11:31:22: K16, RESPONDING\n11:30:58: CMD16, ENROUTE\n11:30:45: UPGRADE TO 2ND ALARM\n11:30:30: MULTIPLE CALLS REPORTING STRUCTURE FIRE\n11:30:15: HEAVY SMOKE VISIBLE FROM STREET\n11:30:00: POSSIBLE ENTRAPMENT REPORTED\n11:29:45: New CFS`,
      dispatch_notified_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      alarms: '2',
      water_on_fire_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      rit_established_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      rehab_established_discontinued_at: null,
      control_utility_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      command_established_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      primary_search_complete_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      loss_stopped_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      action_takens: 'Interior attack, primary search complete, ventilation operations',
      property_loss: 150000,
      contents_loss: 25000,
      pre_incident_property_value: 350000,
      pre_incident_contents_value: 75000,
      department_narratives: [],
      latitude: 38.473689,
      longitude: -78.024778,
      address: '123 MAIN ST',
      suite: 'Apt 4B',
      city: 'CULPEPER',
      state: 'VA',
      zip_code: '22701',
      first_due: 'Reva Volunteer Fire & Rescue  16',
      battalion: 'Reva Volunteer Fire and Rescue',
      response_zone: 'Zone 16A',
      apparatuses: []
    }
  } else if (xrefId.includes('2576001')) {
    // Medical emergency without our units - basic incident data
    return {
      incident_number: xrefId,
      status_code: 'active',
      actual_incident_type: 'Medical Emergency',
      aid_type: null,
      alarm_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      dispatch_type_code: 'CHEST',
      dispatch_comment: `10:45:30: E03, ON SCENE\n10:44:15: A05, ENROUTE\n10:43:45: M07, RESPONDING\n10:43:20: 74 YOM, CHEST PAIN\n10:43:15: CONSCIOUS AND BREATHING\n10:43:00: New CFS`,
      dispatch_notified_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      alarms: '1',
      water_on_fire_at: null,
      rit_established_at: null,
      rehab_established_discontinued_at: null,
      control_utility_at: null,
      command_established_at: null,
      primary_search_complete_at: null,
      loss_stopped_at: null,
      action_takens: null,
      property_loss: null,
      contents_loss: null,
      pre_incident_property_value: null,
      pre_incident_contents_value: null,
      department_narratives: [],
      latitude: 38.475123,
      longitude: -78.018456,
      address: '456 JEFFERSON AVE',
      suite: null,
      city: 'CULPEPER',
      state: 'VA',
      zip_code: '22701',
      first_due: 'Culpeper Fire Department Station 3',
      battalion: 'Culpeper Fire Department',
      response_zone: 'Zone 3B',
      apparatuses: []
    }
  }
  
  // Default for any other xref_id (like the closed MVA)
  return {
    incident_number: xrefId,
    status_code: 'not_started',
    actual_incident_type: null,
    aid_type: null,
    alarm_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    dispatch_type_code: 'MVA',
    dispatch_comment: 'Minor vehicle accident, no injuries reported.',
    dispatch_notified_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    alarms: '1',
    water_on_fire_at: null,
    rit_established_at: null,
    rehab_established_discontinued_at: null,
    control_utility_at: null,
    command_established_at: null,
    primary_search_complete_at: null,
    loss_stopped_at: null,
    action_takens: null,
    property_loss: null,
    contents_loss: null,
    pre_incident_property_value: null,
    pre_incident_contents_value: null,
    department_narratives: [],
    latitude: 38.480689,
    longitude: -78.014778,
    address: '680 HUNTERS RD',
    suite: null,
    city: 'CULPEPER',
    state: 'VA',
    zip_code: '22701',
    first_due: 'Reva Volunteer Fire & Rescue  16',
    battalion: 'Reva Volunteer Fire and Rescue',
    response_zone: 'Zone 16B',
    apparatuses: []
  }
}

const getMockUnitDispatch = (dispatchId: number): UnitDispatch => {
  // Check runtime unit dispatches first
  if (runtimeUnitDispatches.has(dispatchId)) {
    return runtimeUnitDispatches.get(dispatchId)!
  }
  
  // Return different mock unit data based on dispatch ID
  
  if (dispatchId === 39330236) {
    // Structure fire with our units - detailed unit statuses
    return {
      id: 39330236,
      type: "STRUCTURE FIRE",
      status_code: "open",
      incident_type_code: "FHOU",
      unit_codes: ["RE16", "A16", "K16", "CMD16", "E01", "L01"],
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      place_name: "Reva Village Apartments",
      address: "123 MAIN ST",
      address2: "Apt 4B",
      city: "CULPEPER",
      state_code: "VA",
      location: "123 MAIN ST, Apt 4B, CULPEPER, VA, 22701",
      latitude: 38.473689,
      longitude: -78.024778,
      message: "Multi-story residential fire with possible entrapment. Heavy smoke visible from street. Multiple units responding.",
      call_notes: "11:34:15: RE16, ON SCENE\\n11:32:45: A16, ENROUTE\\n11:31:22: K16, RESPONDING\\n11:30:58: CMD16, ENROUTE\\n11:30:45: UPGRADE TO 2ND ALARM\\n11:30:30: MULTIPLE CALLS REPORTING STRUCTURE FIRE",
      units: [
        {
          id: 409140,
          name: "Matthew McClurg",
          email: "mmcclurg@reva16.org",
          statuses: [
            {
              name: "On Scene",
              status_code: "on_scene",
              created_at: new Date(Date.now() - 26 * 60 * 1000).toISOString()
            },
            {
              name: "To Scene",
              status_code: "to_scene",
              created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 409141,
          name: "John Smith",
          email: "jsmith@reva16.org",
          statuses: [
            {
              name: "En Route",
              status_code: "enroute",
              created_at: new Date(Date.now() - 27 * 60 * 1000).toISOString()
            },
            {
              name: "To Scene",
              status_code: "to_scene",
              created_at: new Date(Date.now() - 29 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 409142,
          name: "Sarah Johnson",
          email: "sjohnson@reva16.org",
          statuses: [
            {
              name: "Responding",
              status_code: "responding",
              created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
    }
  } else if (dispatchId === 39330237) {
    // Medical emergency without our units - basic unit data
    return {
      id: 39330237,
      type: "MEDICAL EMERGENCY",
      status_code: "open",
      incident_type_code: "CHEST",
      unit_codes: ["E03", "A05", "M07"],
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      place_name: null,
      address: "456 JEFFERSON AVE",
      address2: null,
      city: "CULPEPER",
      state_code: "VA",
      location: "456 JEFFERSON AVE, CULPEPER, VA, 22701",
      latitude: 38.475123,
      longitude: -78.018456,
      message: "Elderly male, chest pain, conscious and breathing. EMS en route.",
      call_notes: "10:45:30: E03, ON SCENE\\n10:44:15: A05, ENROUTE\\n10:43:45: M07, RESPONDING\\n10:43:20: 74 YOM, CHEST PAIN",
      units: [
        {
          id: 509140,
          name: "Mike Davis",
          email: "mdavis@culpeper03.org",
          statuses: [
            {
              name: "On Scene",
              status_code: "on_scene",
              created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
            },
            {
              name: "En Route",
              status_code: "enroute",
              created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
    }
  }
  
  // Default for closed calls (MVA)
  return {
    id: dispatchId,
    type: "MOTOR VEHICLE ACCIDENT",
    status_code: "closed",
    incident_type_code: "MVA",
    unit_codes: ["A16", "E12", "PD50"],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    place_name: null,
    address: "680 HUNTERS RD",
    address2: null,
    city: "CULPEPER",
    state_code: "VA",
    location: "680 HUNTERS RD, CULPEPER, VA, 22701",
    latitude: 38.480689,
    longitude: -78.014778,
    message: null,
    call_notes: "Minor vehicle accident, no injuries reported.",
    units: [
      {
        id: 309140,
        name: "Tom Wilson",
        email: "twilson@reva16.org",
        statuses: [
          {
            name: "Complete",
            status_code: "complete",
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            name: "On Scene",
            status_code: "on_scene",
            created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ]
  }
}

// Mock schedule data for testing
const getMockScheduleData = (): ScheduleResponse => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  // Create times that will be active "now" for testing
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').replace('.000Z', '') // 2 hours ago
  const endTime = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString().replace('T', ' ').replace('.000Z', '') // 6 hours from now
  const shortEndTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').replace('.000Z', '') // 2 hours from now
  
  return [
    {
      date: today,
      rotations: [],
      assignments: [
        {
          id: 48549,
          start_at_local: startTime,
          end_at_local: endTime,
          name: "On Duty",
          city: "",
          pos: 1,
          local_timezone: "America/New_York",
          fire_station_id: null,
          station: null,
          is_snap: false,
          is_sign_up_eligible: true,
          to_assignment_id: null,
          is_without_time: true,
          is_archived: false,
          note: null,
          note_created_at: null,
          note_created_by: null,
          positions: [
            {
              id: 663114,
              qualifier: {
                id: 34829,
                name: "Duty Officer",
                shortcode: "DUTY OIC",
                color: "#607d8b",
                is_deleted: false
              },
              is_vacancy: false,
              work_shifts: [
                {
                  id: 5378807,
                  work_date: today,
                  start_at_local: startTime,
                  end_at_local: shortEndTime,
                  local_timezone: "America/New_York",
                  notes: "",
                  call_shift_id: null,
                  mandatory_fill_id: null,
                  work_type: {
                    id: 19425,
                    name: "Response 16",
                    shortcode: "RESP16",
                    color: "#ff5722",
                    is_shift_type: true
                  },
                  work_subtype: null,
                  user: {
                    id: 405348,
                    personnel_id: 214514,
                    personnel_agency_id: null,
                    first_name: "Joseph",
                    last_name: "Galvin",
                    middle_name: null,
                    public_name: "Joseph Galvin",
                    is_active: true,
                    phone: "(540) 718-9230",
                    email: "Jgalvin@reva16.org",
                    avatar: "https://sizeup.firstduesizeup.com/w/avatar/405348",
                    qualifier_required: "Duty Officer",
                    qualifier_color: "#607d8b",
                    station: {
                      id: 13814,
                      name: "Reva Volunteer Fire & Rescue  16"
                    }
                  },
                  scheduled_by: {
                    id: 405348,
                    first_name: "Joseph",
                    last_name: "Galvin"
                  },
                  segments: [],
                  trade_id: null,
                  project_code: null,
                  holdover: null,
                  use_length_for_ranking: false,
                  type: "workShift",
                  is_from_awt: true
                }
              ],
              vacancy_segments: [],
              pos: 1,
              is_vacant: false,
              is_extra_vacancy: false
            }
          ],
          schedule_groups: [],
          board: [{ id: 5434 }],
          is_recurring: true,
          range_start: "2025-06-28 06:00:00",
          range_end: "2038-01-01 06:00:00",
          is_validated: false,
          duration_hours: 24
        },
        {
          id: 48550,
          start_at_local: startTime,
          end_at_local: endTime,
          name: "Ambulance 16",
          city: "",
          pos: 2,
          local_timezone: "America/New_York",
          fire_station_id: 13814,
          station: "Reva Volunteer Fire & Rescue  16",
          is_snap: false,
          is_sign_up_eligible: true,
          to_assignment_id: 48549,
          is_without_time: true,
          is_archived: false,
          note: null,
          note_created_at: null,
          note_created_by: null,
          positions: [
            {
              id: 663121,
              qualifier: {
                id: 34796,
                name: "Ambulance Driver",
                shortcode: "A",
                color: "#2196f3",
                is_deleted: false
              },
              is_vacancy: false,
              work_shifts: [
                {
                  id: 5381004,
                  work_date: today,
                  start_at_local: startTime,
                  end_at_local: endTime,
                  local_timezone: "America/New_York",
                  notes: null,
                  call_shift_id: null,
                  mandatory_fill_id: null,
                  work_type: {
                    id: 18559,
                    name: "Duty Crew",
                    shortcode: "DUTY",
                    color: "#03a9f4",
                    is_shift_type: true
                  },
                  work_subtype: null,
                  user: {
                    id: 409128,
                    personnel_id: 216933,
                    personnel_agency_id: null,
                    first_name: "David",
                    last_name: "Zager",
                    middle_name: null,
                    public_name: "David Zager",
                    is_active: true,
                    phone: "(919) 525-0074",
                    email: "dzager@reva16.org",
                    avatar: null,
                    qualifier_required: "Ambulance Driver",
                    qualifier_color: "#2196f3",
                    station: {
                      id: 13814,
                      name: "Reva Volunteer Fire & Rescue  16"
                    }
                  },
                  scheduled_by: {
                    id: 409128,
                    first_name: "David",
                    last_name: "Zager"
                  },
                  segments: [],
                  trade_id: null,
                  project_code: null,
                  holdover: null,
                  use_length_for_ranking: false,
                  type: "workShift",
                  is_from_awt: true
                }
              ],
              vacancy_segments: [],
              pos: 1,
              is_vacant: false,
              is_extra_vacancy: false
            },
            {
              id: 663122,
              qualifier: {
                id: 34787,
                name: "EMT",
                shortcode: "EMT",
                color: "#2196f3",
                is_deleted: false
              },
              is_vacancy: false,
              work_shifts: [
                {
                  id: 5376668,
                  work_date: today,
                  start_at_local: startTime,
                  end_at_local: shortEndTime,
                  local_timezone: "America/New_York",
                  notes: null,
                  call_shift_id: null,
                  mandatory_fill_id: null,
                  work_type: {
                    id: 18559,
                    name: "Duty Crew",
                    shortcode: "DUTY",
                    color: "#03a9f4",
                    is_shift_type: true
                  },
                  work_subtype: null,
                  user: {
                    id: 405349,
                    personnel_id: 214515,
                    personnel_agency_id: null,
                    first_name: "Joshua",
                    last_name: "Hall",
                    middle_name: null,
                    public_name: "Joshua Hall",
                    is_active: true,
                    phone: "(703) 622-5505",
                    email: "jhall@reva16.org",
                    avatar: "https://sizeup.firstduesizeup.com/w/avatar/405349",
                    qualifier_required: "EMT",
                    qualifier_color: "#2196f3",
                    station: {
                      id: 13814,
                      name: "Reva Volunteer Fire & Rescue  16"
                    }
                  },
                  scheduled_by: {
                    id: 405349,
                    first_name: "Joshua",
                    last_name: "Hall"
                  },
                  segments: [],
                  trade_id: null,
                  project_code: null,
                  holdover: null,
                  use_length_for_ranking: false,
                  type: "workShift",
                  is_from_awt: true
                }
              ],
              vacancy_segments: [],
              pos: 2,
              is_vacant: false,
              is_extra_vacancy: false
            }
          ],
          schedule_groups: [],
          board: [{ id: 5434 }, { id: 5439 }],
          is_recurring: true,
          range_start: "2025-06-28 06:00:00",
          range_end: "2038-01-01 06:00:00",
          is_validated: false,
          duration_hours: 24
        }
      ],
      unassigned: []
    }
  ]
}

// Helper function to format schedule API dates
const formatScheduleDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Fetch current schedule/staffing data
export const fetchCurrentSchedule = async (): Promise<ScheduleResponse> => {
  if (shouldUseMockData()) {
    return getMockScheduleData()
  }

  try {
    const today = new Date()
    const start = encodeURIComponent(`${formatScheduleDate(today)}T00:00:00Z`)
    const end = encodeURIComponent(`${formatScheduleDate(today)}T23:59:59Z`)
    
    const response = await fetch(`${PROXY_URL}/api/schedule?start=${start}&end=${end}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: ScheduleResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching schedule:', error)
    throw error
  }
}

// Helper function to extract currently staffed positions
export const getCurrentlyStaffed = (scheduleData: ScheduleResponse): StaffedPosition[] => {
  const staffed: StaffedPosition[] = []
  const now = new Date()
  
  for (const day of scheduleData) {
    for (const assignment of day.assignments) {
      for (const position of assignment.positions) {
        for (const workShift of position.work_shifts) {
          const startTime = new Date(workShift.start_at_local)
          const endTime = new Date(workShift.end_at_local)
          
          console.log('Checking work shift:', {
            user: workShift.user.public_name,
            start: workShift.start_at_local,
            end: workShift.end_at_local,
            startParsed: startTime,
            endParsed: endTime,
            now,
            isActive: now >= startTime && now <= endTime
          })
          
          // Check if the work shift is currently active
          if (now >= startTime && now <= endTime) {
            staffed.push({
              assignmentName: assignment.name,
              positionName: position.qualifier?.name,
              user: workShift.user,
              workShift,
              startTime: workShift.start_at_local,
              endTime: workShift.end_at_local
            })
          }
        }
      }
    }
  }
  
  return staffed
}