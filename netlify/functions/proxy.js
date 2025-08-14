import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import serverless from 'serverless-http'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PROXY_PORT || 3001

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  exposedHeaders: ['link', 'x-total-count', 'x-page', 'x-per-page', 'x-total-pages']
}))

app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FirstDue Proxy' })
})

// Weather endpoint for Culpeper, VA using Open-Meteo
app.get('/weather', async (req, res) => {
  try {
    // Coordinates for 18230 Birmingham Road, Culpeper, VA 22701
    const lat = 38.4707
    const lon = -78.0169
    
    // Use Open-Meteo API (free, no API key required)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=sunrise,sunset&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
    
    const response = await fetch(weatherUrl)

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    res.json(data)
    
  } catch (error) {
    console.error('Weather proxy error:', error.message)
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: error.message 
    })
  }
})

// Proxy all FirstDue API endpoints
app.use('/api', async (req, res) => {
  try {
    const token = process.env.FD_TOKEN
    
    if (!token) {
      return res.status(500).json({ 
        error: 'FD_TOKEN not configured on server' 
      })
    }

    // Remove '/api' prefix and forward to FirstDue
    const apiPath = req.path
    const apiUrl = `https://sizeup.firstduesizeup.com/fd-api/v1${apiPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`
    
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    })

    if (!response.ok) {
      throw new Error(`FirstDue API error: ${response.status} ${response.statusText}`)
    }

    // Copy headers more explicitly to ensure they're preserved
    for (const [key, value] of response.headers.entries()) {
      // Skip headers that Express should handle automatically or that might cause conflicts
      const skipHeaders = [
        'content-encoding', 
        'content-length', 
        'transfer-encoding',
        'connection',
        'keep-alive',
        'vary',
        'server'
      ]
      if (!skipHeaders.includes(key.toLowerCase())) {
        res.set(key, value)
      }
    }

    const data = await response.json()
    res.json(data)
    
  } catch (error) {
    console.error('Proxy error:', error.message)
    res.status(500).json({ 
      error: 'Failed to fetch from FirstDue API',
      details: error.message 
    })
  }
})

// Export for Netlify Functions
export const handler = serverless(app)

// Export the app for local development
export default app

// Only start the server if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`🚀 FirstDue Proxy server running on http://localhost:${PORT}`)
    console.log(`🔗 Frontend should point to: http://localhost:${PORT}/api`)
    console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  })
}