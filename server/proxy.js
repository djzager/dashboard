import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FirstDue Proxy' })
})

// Weather endpoint for Culpeper, VA
app.get('/weather', async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OPENWEATHER_API_KEY not configured on server' 
      })
    }

    // Coordinates for 18230 Birmingham Road, Culpeper, VA 22701
    const lat = 38.4707
    const lon = -78.0169
    
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    
    const response = await fetch(weatherUrl)

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`)
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

app.listen(PORT, () => {
  console.log(`🚀 FirstDue Proxy server running on http://localhost:${PORT}`)
  console.log(`🔗 Frontend should point to: http://localhost:${PORT}/api`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
})