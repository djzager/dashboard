export interface Apparatus {
  uuid: string
  name: string
  unit_code: string
  use_code: string
  use_name: string
  location?: string
}

export type ApparatusStatus = 'in_service' | 'out_of_service'

export interface ApparatusWithStatus extends Apparatus {
  status: ApparatusStatus
  last_updated: string
}

export interface ApparatusApiResponse {
  list: Apparatus[]
  total: number
}

export const getApparatusTypeColor = (useCode: string): string => {
  switch (useCode) {
    case '1': // Suppression
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case '2': // EMS
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case '0': // Other
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

export const getStatusColor = (status: ApparatusStatus): string => {
  switch (status) {
    case 'in_service':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'out_of_service':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
}