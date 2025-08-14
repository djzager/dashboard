// FirstDue fire incident data structure from /fire-incidents endpoint
export interface FireIncident {
  incident_number: string
  status_code: string
  actual_incident_type: string | null
  aid_type: string | null
  alarm_at: string
  created_at: string
  updated_at: string
  dispatch_type_code: string
  dispatch_comment: string
  dispatch_notified_at: string
  alarms: string
  water_on_fire_at: string | null
  rit_established_at: string | null
  rehab_established_discontinued_at: string | null
  control_utility_at: string | null
  command_established_at: string | null
  primary_search_complete_at: string | null
  loss_stopped_at: string | null
  action_takens: string | null
  property_loss: number | null
  contents_loss: number | null
  pre_incident_property_value: number | null
  pre_incident_contents_value: number | null
  department_narratives: any[]
  latitude: number | null
  longitude: number | null
  address: string
  suite: string | null
  city: string
  state: string
  zip_code: string
  first_due: string
  battalion: string
  response_zone: string | null
  apparatuses: any[]
}