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
    // Refresh weather every hour
    const interval = setInterval(fetchWeather, 60 * 60 * 1000)
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
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
        <div className="flex-1 flex flex-col justify-between">
          {/* Main temperature display - more compact */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {weather.icon && (
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                  <div className="text-white text-2xl">☀</div>
                </div>
              )}
              <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white">
                  {weather.temperature}°F
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Feels like {weather.temperatureFeelsLike}°F
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
              {weather.description}
            </div>
          </div>

          {/* Compact weather grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
              <div className="text-blue-600 dark:text-blue-400 font-semibold">WIND</div>
              <div className="font-bold text-blue-800 dark:text-blue-200">
                {weather.windSpeed} mph {weather.windDirectionText}
              </div>
            </div>
            
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
              <div className="text-blue-600 dark:text-blue-400 font-semibold">HUMIDITY</div>
              <div className="font-bold text-blue-800 dark:text-blue-200">
                {weather.humidity}%
              </div>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
              <div className="text-blue-600 dark:text-blue-400 font-semibold">PRESSURE</div>
              <div className="font-bold text-blue-800 dark:text-blue-200">
                {weather.pressure} mb
              </div>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
              <div className="text-blue-600 dark:text-blue-400 font-semibold">VISIBILITY</div>
              <div className="font-bold text-blue-800 dark:text-blue-200">
                {weather.visibility} mi
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather