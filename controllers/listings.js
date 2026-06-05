const Listing = require('../models/listing');
const { geocodeAddress } = require('../utils/geocoding');
const { isDatabaseConnected } = require('../utils/database');

const DEFAULT_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeImageUrl = (listing) => {
    if (!listing || !listing.image || !listing.image.url) return;
    const url = listing.image.url;
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
    if (!isAbsolute) {
        listing.image.url = `/uploads/${url}`;
    }
};

    const normalizeCoordinates = (listing) => {
        if (!listing || !listing.coordinates) return null;
        const lat = Number(listing.coordinates.latitude);
        const lng = Number(listing.coordinates.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            listing.coordinates.latitude = lat;
            listing.coordinates.longitude = lng;
            return { latitude: lat, longitude: lng };
        }
        return null;
    };

    const isLikelyPlaceholderCoords = (listing, coords) => {
        if (!coords) return false;
        const lat = Number(coords.latitude);
        const lng = Number(coords.longitude);
        const nearDelhi = Math.abs(lat - 28.7041) < 0.02 && Math.abs(lng - 77.1025) < 0.02;
        if (!nearDelhi) return false;

        const location = (listing.location || '').toLowerCase();
        const country = (listing.country || '').toLowerCase();
        const isDelhiListing = location.includes('delhi') || country.includes('india');
        return !isDelhiListing;
    };

const resolveSubmittedImage = (req) => {
    if (req.file && req.file.path) {
        return {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    const submittedUrl = req.body
        && req.body.listing
        && req.body.listing.image
        && typeof req.body.listing.image.url === 'string'
        ? req.body.listing.image.url.trim()
        : '';

    if (submittedUrl) {
        return {
            url: submittedUrl,
            filename: 'external-image-url'
        };
    }

    return {
        url: DEFAULT_IMAGE,
        filename: 'default-listing-image'
    };
};

module.exports.index = async(req, res)=>{
    const query = {};
    const searchQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const isOwnerView = req.query.owner === 'me';
    if (!isDatabaseConnected()) {
        return res.render('listings/index', {
            allListing: [],
            searchQuery,
            isOwnerView,
            databaseUnavailable: true
        });
    }
    if (req.query.owner === 'me' && req.user) {
        query.owner = req.user._id;
    }
    if (searchQuery) {
        const searchRegex = new RegExp(escapeRegex(searchQuery), 'i');
        query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
            { country: searchRegex }
        ];
    }
    const allListing = await Listing.find(query);
    allListing.forEach(normalizeImageUrl);
    res.render('listings/index', {
        allListing,
        searchQuery,
        isOwnerView,
        databaseUnavailable: false
    });
};
module.exports.renderNewForm = (req, res)=>{
    res.render('listings/newListing');
};
module.exports.showListing = async (req, res) => {
    if (!isDatabaseConnected()) {
        req.flash('error', 'Database is not connected. Listings are unavailable right now.');
        return res.redirect('/listings');
    }
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
        .populate({path:"reviews", populate:{path:"author"}})
        .populate("owner");
    if(!listing){
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    let mapCoordinates = normalizeCoordinates(listing);
    const shouldRefresh = !mapCoordinates || isLikelyPlaceholderCoords(listing, mapCoordinates);
    if (shouldRefresh && listing.location && listing.country) {
        const coordinates = await geocodeAddress(listing.location, listing.country);
        if (coordinates) {
            listing.coordinates = coordinates;
            await listing.save();
            mapCoordinates = coordinates;
        }
    }
    normalizeImageUrl(listing);
    res.render('listings/show', { listing, mapCoordinates });
};
module.exports.renderEditForm = async (req, res) => {
    if (!isDatabaseConnected()) {
        req.flash('error', 'Database is not connected. Listings are unavailable right now.');
        return res.redirect('/listings');
    }
    let { id } = req.params;
    const listing = await Listing.findById(id);
    normalizeImageUrl(listing);
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit", { listing , originalImage});
};
module.exports.addListing = async (req, res, next) => {
    if (!isDatabaseConnected()) {
        req.flash('error', 'Database is not connected. Please configure ATLASDB_URL before creating listings.');
        return res.redirect('/listings');
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = resolveSubmittedImage(req);
    
    // Geocode the address to get coordinates
    const coordinates = await geocodeAddress(newListing.location, newListing.country);
    if (coordinates) {
        newListing.coordinates = coordinates;
    }
    
    // // Handle file upload if provided
    // if (req.file) {
    //     newListing.image = {
    //         filename: req.file.filename,
    //         url: `/uploads/${req.file.filename}`
    //     };
    // }
    
    await newListing.save();
    req.flash('success', 'new listing created!');
    res.redirect('/listings');
};
module.exports.updateListing = async (req, res) => {
    if (!isDatabaseConnected()) {
        req.flash('error', 'Database is not connected. Listings are unavailable right now.');
        return res.redirect('/listings');
    }
    let { id } = req.params;
    let lisitng = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    // Geocode the address if location or country changed
    const coordinates = await geocodeAddress(lisitng.location, lisitng.country);
    if (coordinates) {
        lisitng.coordinates = coordinates;
    }

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        lisitng.image = {url, filename};
    }
    await lisitng.save();
    req.flash('success', 'listing updated successfully!');
    res.redirect(`/listings/${id}`);
};
module.exports.deleteListing = async (req, res) => {
    if (!isDatabaseConnected()) {
        req.flash('error', 'Database is not connected. Listings are unavailable right now.');
        return res.redirect('/listings');
    }
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', "listing deleted successfully!");
    res.redirect('/listings');
};

module.exports.renderMapView = async (req, res) => {
    const allListings = await Listing.find({});
    allListings.forEach(normalizeImageUrl);
    res.render('listings/map', { allListings });
};
