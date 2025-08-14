// Types for schedule/staffing API

export interface User {
  id: number;
  personnel_id: number;
  personnel_agency_id: number | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  public_name: string;
  is_active: boolean;
  phone: string;
  email: string;
  avatar: string | null;
  qualifier_required: string;
  qualifier_color: string;
  station: {
    id: number;
    name: string;
  };
}

export interface WorkType {
  id: number;
  name: string;
  shortcode: string;
  color: string;
  is_shift_type: boolean;
}

export interface WorkShift {
  id: number;
  work_date: string;
  start_at_local: string;
  end_at_local: string;
  local_timezone: string;
  notes: string | null;
  call_shift_id: number | null;
  mandatory_fill_id: number | null;
  work_type: WorkType;
  work_subtype: any | null;
  user: User;
  scheduled_by: {
    id: number;
    first_name: string;
    last_name: string;
  };
  segments: any[];
  trade_id: number | null;
  project_code: string | null;
  holdover: any | null;
  use_length_for_ranking: boolean;
  type: string;
  is_from_awt: boolean;
}

export interface Qualifier {
  id: number;
  name: string;
  shortcode: string;
  color: string;
  is_deleted: boolean;
}

export interface Position {
  id: number;
  qualifier: Qualifier | null;
  is_vacancy: boolean;
  work_shifts: WorkShift[];
  vacancy_segments: any[];
  pos: number;
  is_vacant: boolean;
  is_extra_vacancy: boolean;
}

export interface Assignment {
  id: number;
  start_at_local: string;
  end_at_local: string;
  name: string;
  city: string;
  pos: number;
  local_timezone: string;
  fire_station_id: number | null;
  station: string | null;
  is_snap: boolean;
  is_sign_up_eligible: boolean;
  to_assignment_id: number | null;
  is_without_time: boolean;
  is_archived: boolean;
  note: string | null;
  note_created_at: string | null;
  note_created_by: string | null;
  positions: Position[];
  schedule_groups: any[];
  board: { id: number }[] | null;
  is_recurring: boolean;
  range_start: string;
  range_end: string;
  is_validated: boolean;
  duration_hours: number;
}

export interface ScheduleDay {
  date: string;
  rotations: any[];
  assignments: Assignment[];
  unassigned: any[];
}

export type ScheduleResponse = ScheduleDay[];

// Helper types for displaying staffing
export interface StaffedPosition {
  assignmentName: string;
  positionName?: string;
  user: User;
  workShift: WorkShift;
  endTime: string;
  startTime: string;
}