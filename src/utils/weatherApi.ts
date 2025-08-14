import { WeatherData, getWindDirection } from '../types/weather'

// Default coordinates for the firehouse - update these with actual location
const LATITUDE = import.meta.env.VITE_LATITUDE || '40.7128'
const LONGITUDE = import.meta.env.VITE_LONGITUDE || '-74.0060'

interface OpenMeteoResponse {
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    pressure_msl: number
    visibility?: number
    uv_index?: number
  }
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
  }
}

const getWeatherDescription = (weatherCode: number): { condition: string; description: string; icon: string } => {
  // Open-Meteo weather codes mapping
  const weatherMap: Record<number, { condition: string; description: string; icon: string }> = {
    0: { condition: 'Clear', description: 'clear sky', icon: '01d' },
    1: { condition: 'Clear', description: 'mainly clear', icon: '01d' },
    2: { condition: 'Partly Cloudy', description: 'partly cloudy', icon: '02d' },
    3: { condition: 'Cloudy', description: 'overcast', icon: '03d' },
    45: { condition: 'Fog', description: 'fog', icon: '50d' },
    48: { condition: 'Fog', description: 'depositing rime fog', icon: '50d' },
    51: { condition: 'Drizzle', description: 'light drizzle', icon: '09d' },
    53: { condition: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
    55: { condition: 'Drizzle', description: 'dense drizzle', icon: '09d' },
    61: { condition: 'Rain', description: 'slight rain', icon: '10d' },
    63: { condition: 'Rain', description: 'moderate rain', icon: '10d' },
    65: { condition: 'Rain', description: 'heavy rain', icon: '10d' },
    71: { condition: 'Snow', description: 'slight snow fall', icon: '13d' },
    73: { condition: 'Snow', description: 'moderate snow fall', icon: '13d' },
    75: { condition: 'Snow', description: 'heavy snow fall', icon: '13d' },
    80: { condition: 'Rain', description: 'slight rain showers', icon: '09d' },
    81: { condition: 'Rain', description: 'moderate rain showers', icon: '09d' },
    82: { condition: 'Rain', description: 'violent rain showers', icon: '09d' },
    85: { condition: 'Snow', description: 'slight snow showers', icon: '13d' },
    86: { condition: 'Snow', description: 'heavy snow showers', icon: '13d' },
    95: { condition: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
    96: { condition: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '11d' },
    99: { condition: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' }
  }
  
  return weatherMap[weatherCode] || { condition: 'Unknown', description: 'unknown', icon: '01d' }
}

const formatTime = (timeString: string): string => {
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=sunrise,sunset&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
    
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Open-Meteo API error! status: ${response.status}`)
    }

    const data: OpenMeteoResponse = await response.json()
    const weatherInfo = getWeatherDescription(data.current.weather_code)
    
    return {
      temperature: Math.round(data.current.temperature_2m),
      temperatureFeelsLike: Math.round(data.current.apparent_temperature),
      condition: weatherInfo.condition,
      description: weatherInfo.description,
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: data.current.wind_direction_10m,
      windDirectionText: getWindDirection(data.current.wind_direction_10m),
      pressure: Math.round(data.current.pressure_msl),
      visibility: 10, // Open-Meteo doesn't provide visibility in basic plan
      uvIndex: data.current.uv_index,
      icon: weatherInfo.icon,
      sunrise: formatTime(data.daily.sunrise[0]),
      sunset: formatTime(data.daily.sunset[0]),
      lastUpdated: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  } catch (error) {
    console.error('Failed to fetch weather data:', error)
    return getMockWeatherData()
  }
}

const getMockWeatherData = (): WeatherData => {
  return {
    temperature: 72,
    temperatureFeelsLike: 75,
    condition: 'Partly Cloudy',
    description: 'partly cloudy',
    humidity: 65,
    windSpeed: 8,
    windDirection: 225,
    windDirectionText: 'SW',
    pressure: 1013,
    visibility: 10,
    icon: '02d',
    sunrise: '7:15 AM',
    sunset: '6:45 PM',
    lastUpdated: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
}