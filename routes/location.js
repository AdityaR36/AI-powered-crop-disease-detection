const express = require('express');
const router = express.Router();

// Mock data for location services
// In a real app, this would use a Geocoding API or a database of locations

router.get('/reverse-geocode', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Mock response simulating a reverse geocode
        // You can replace this with OpenWeatherMap Geocoding API or Google Maps API
        const mockAddress = {
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            country: 'India',
            pincode: '226001',
            formatted: 'Lucknow, Uttar Pradesh, India'
        };

        res.json({
            success: true,
            data: mockAddress
        });
    } catch (error) {
        console.error('Reverse geocode error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching location details'
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Mock search results
        const mockResults = [
            { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
            { name: 'Delhi, India', lat: 28.6139, lon: 77.2090 },
            { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
            { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
            { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 }
        ].filter(city => city.name.toLowerCase().includes(query.toLowerCase()));

        res.json({
            success: true,
            data: mockResults
        });
    } catch (error) {
        console.error('Location search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching locations'
        });
    }
});

module.exports = router;
