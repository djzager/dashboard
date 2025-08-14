import { useState, useEffect } from 'react'
import { WeatherData } from '../types/weather'
import { fetchWeatherData } from '../utils/weatherApi'

interface WeatherProps {
  className?: string
}

const Weather: React.FC<WeatherProps> = ({ className = '' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchWeather = async () => {
    try {
      setLoading(true)
      const weatherData = await fetchWeatherData()
      setWeather(weatherData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch weather')
      console.error('Error fetching weather:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !weather) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Weather</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error && !weather) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Weather</h2>
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">⚠️ {error}</div>
          <button 
            onClick={fetchWeather}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Weather</h2>
        <button 
          onClick={fetchWeather}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title="Refresh weather"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {weather && (
        <div className="space-y-4">
          {/* Main temperature display */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              {weather.icon && (
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  className="w-16 h-16"
                />
              )}
              <div>
                <div className="text-4xl font-bold text-gray-800 dark:text-white">
                  {weather.temperature}°F
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Feels like {weather.temperatureFeelsLike}°F
                </div>
              </div>
            </div>
            <div className="text-gray-600 dark:text-gray-300 mb-2 capitalize">
              {weather.description}
            </div>
          </div>

          {/* Weather details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Wind</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {weather.windSpeed} mph {weather.windDirectionText}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Humidity</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {weather.humidity}%
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Pressure</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {weather.pressure} mb
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Visibility</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {weather.visibility} mi
              </div>
            </div>
          </div>

          {/* Sun times */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sunrise: </span>
                <span className="font-medium text-gray-800 dark:text-white">{weather.sunrise}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sunset: </span>
                <span className="font-medium text-gray-800 dark:text-white">{weather.sunset}</span>
              </div>
            </div>
          </div>

          {/* Last updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Updated: {weather.lastUpdated}
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather