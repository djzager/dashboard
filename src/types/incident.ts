import { Dispatch } from './dispatch'
import { FireIncident } from './fire-incident'
import { UnitDispatch } from './unit-dispatch'

// Combined incident data structure that aggregates information from multiple FirstDue sources
export interface Incident {
  // Core dispatch data from FirstDue /dispatches endpoint
  dispatch: Dispatch
  
  // Additional fire incident data from FirstDue /fire-incidents endpoint (only for open dispatches)
  fireIncident?: FireIncident
  
  // Unit dispatch data from FirstDue /get-units-by-dispatches endpoint (only for open dispatches)
  unitDispatch?: UnitDispatch
  
  // Future data sources can be added here:
  // timeline?: IncidentEvent[] // from incident timeline API
  // apparatus?: ApparatusStatus[] // from apparatus tracking
}

// Results structure for paginated incident data
export interface IncidentPage {
  incidents: Incident[]
  nextPageUrl?: string
  hasMore: boolean
}