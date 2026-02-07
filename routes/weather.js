const express = require('express');
const router = express.Router();
const axios = require('axios');

// OpenWeatherMap API configuration
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'your-api-key-here';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get weather by coordinates
router.get('/current', async (req, res) => {
    try {
        const { lat, lon, lang = 'en' } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
            params: {
                lat,
                lon,
                appid: WEATHER_API_KEY,
                units: 'metric',
                lang: lang === 'hi' ? 'hi' : lang === 'ta' ? 'ta' : 'en'
            }
        });

        const weather = response.data;

        res.json({
            success: true,
            data: {
                temperature: Math.round(weather.main.temp),
                feelsLike: Math.round(weather.main.feels_like),
                humidity: weather.main.humidity,
                description: weather.weather[0].description,
                icon: weather.weather[0].icon,
                windSpeed: weather.wind.speed,
                pressure: weather.main.pressure,
                visibility: weather.visibility,
                clouds: weather.clouds.all,
                sunrise: weather.sys.sunrise,
                sunset: weather.sys.sunset,
                location: weather.name,
                country: weather.sys.country,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Weather API error:', error.message);

        // Return mock data if API fails
        res.json({
            success: true,
            data: {
                temperature: 28,
                feelsLike: 30,
                humidity: 65,
                description: 'Partly cloudy',
                icon: '02d',
                windSpeed: 3.5,
                pressure: 1013,
                visibility: 10000,
                clouds: 40,
                sunrise: Math.floor(Date.now() / 1000) - 21600,
                sunset: Math.floor(Date.now() / 1000) + 21600,
                location: 'Unknown',
                country: 'IN',
                timestamp: new Date().toISOString(),
                mock: true
            }
        });
    }
});

// Get weather forecast
router.get('/forecast', async (req, res) => {
    try {
        const { lat, lon, lang = 'en' } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
            params: {
                lat,
                lon,
                appid: WEATHER_API_KEY,
                units: 'metric',
                lang: lang === 'hi' ? 'hi' : lang === 'ta' ? 'ta' : 'en'
            }
        });

        const forecast = response.data.list.slice(0, 8).map(item => ({
            timestamp: item.dt,
            temperature: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            precipitation: item.pop * 100
        }));

        res.json({
            success: true,
            data: forecast
        });
    } catch (error) {
        console.error('Forecast API error:', error.message);

        // Return mock forecast data
        const mockForecast = Array.from({ length: 8 }, (_, i) => ({
            timestamp: Math.floor(Date.now() / 1000) + (i * 10800),
            temperature: 25 + Math.floor(Math.random() * 10),
            description: 'Clear sky',
            icon: '01d',
            humidity: 60 + Math.floor(Math.random() * 20),
            windSpeed: 2 + Math.random() * 3,
            precipitation: Math.floor(Math.random() * 30)
        }));

        res.json({
            success: true,
            data: mockForecast,
            mock: true
        });
    }
});

// Get weather alerts
router.get('/alerts', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // In production, integrate with weather alert API
        // For now, return mock alerts based on weather conditions

        res.json({
            success: true,
            data: {
                alerts: [],
                recommendations: [
                    'Good conditions for planting',
                    'Maintain regular watering schedule',
                    'Monitor for pests during warm weather'
                ]
            }
        });
    } catch (error) {
        console.error('Weather alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weather alerts'
        });
    }
});

// Geocoding - get coordinates from location name
router.get('/geocode', async (req, res) => {
    try {
        const { query, lang = 'en' } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Location query is required'
            });
        }

        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
            params: {
                q: query,
                limit: 5,
                appid: WEATHER_API_KEY
            }
        });

        const locations = response.data.map(loc => ({
            name: loc.name,
            state: loc.state,
            country: loc.country,
            lat: loc.lat,
            lon: loc.lon
        }));

        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Geocoding error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error geocoding location',
            data: []
        });
    }
});

// Reverse geocoding - get location name from coordinates
router.get('/reverse-geocode', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/reverse`, {
            params: {
                lat,
                lon,
                limit: 1,
                appid: WEATHER_API_KEY
            }
        });

        if (response.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const location = response.data[0];

        res.json({
            success: true,
            data: {
                name: location.name,
                state: location.state,
                country: location.country,
                lat: location.lat,
                lon: location.lon
            }
        });
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error reverse geocoding coordinates'
        });
    }
});

module.exports = router;
