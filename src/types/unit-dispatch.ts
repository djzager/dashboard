export interface UnitStatus {
  name: string
  status_code: string
  created_at: string
}

export interface Unit {
  id: number
  name: string
  email: string
  statuses: UnitStatus[]
}

export interface UnitDispatch {
  id: number
  type: string
  status_code: string
  incident_type_code: string
  unit_codes: string[]
  created_at: string
  place_name: string | null
  address: string
  address2: string | null
  city: string
  state_code: string
  location: string
  latitude: number
  longitude: number
  message: string | null
  call_notes: string
  units: Unit[]
}

export interface UnitDispatchApiResponse {
  data?: UnitDispatch[]
  // API returns array directly based on example
}