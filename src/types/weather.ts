export interface WeatherData {
  temperature: number
  temperatureFeelsLike: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  windDirection: number
  windDirectionText: string
  pressure: number
  visibility: number
  uvIndex?: number
  icon: string
  sunrise: string
  sunset: string
  lastUpdated: string
}

export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round(degrees / 22.5) % 16]
}