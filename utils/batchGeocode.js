const mongoose = require('mongoose');
const Listing = require('../models/listing');
const { geocodeAddress } = require('./geocoding');

// Function to batch geocode all listings
const batchGeocodeListings = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://127.0.0.1:27017/airbnb");
        console.log("Connected to MongoDB");

        // Find all listings
        const listings = await Listing.find({});
        console.log(`Found ${listings.length} listings to geocode`);

        let successCount = 0;
        let skipCount = 0;

        for (const listing of listings) {
            // Skip if coordinates already exist
            if (listing.coordinates && listing.coordinates.latitude && listing.coordinates.longitude) {
                console.log(`Skipping "${listing.title}" - coordinates already exist`);
                skipCount++;
                continue;
            }

            // Geocode the address
            if (listing.location && listing.country) {
                console.log(`Geocoding: ${listing.title} (${listing.location}, ${listing.country})...`);
                const coordinates = await geocodeAddress(listing.location, listing.country);
                
                if (coordinates) {
                    listing.coordinates = coordinates;
                    await listing.save();
                    console.log(`✓ Updated "${listing.title}" with coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
                    successCount++;
                } else {
                    console.log(`✗ Failed to geocode "${listing.title}"`);
                }
            }

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`\n✓ Batch geocoding complete!`);
        console.log(`Successfully geocoded: ${successCount}`);
        console.log(`Skipped (already have coordinates): ${skipCount}`);
        
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error during batch geocoding:", error);
        process.exit(1);
    }
};

// Run if this file is executed directly
if (require.main === module) {
    require('dotenv').config();
    batchGeocodeListings();
}

module.exports = { batchGeocodeListings };
