const axios = require('axios');

// Function to geocode address to coordinates using OpenStreetMap Nominatim (free service)
const geocodeAddress = async (address, country) => {
    try {
        const fullAddress = `${address}, ${country}`;
        
        // Use OpenStreetMap Nominatim API (free, no API key required)
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: fullAddress,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'AirbnbClone/1.0' // Nominatim requires a user agent
            }
        });

        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            return {
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon)
            };
        } else {
            console.warn(`No geocoding results found for: ${fullAddress}`);
            return null;
        }
    } catch (error) {
        console.error(`Geocoding error for ${address}, ${country}:`, error.message);
        return null;
    }
};

module.exports = { geocodeAddress };
