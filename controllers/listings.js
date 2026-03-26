const Listing = require('../models/listing');

const normalizeImageUrl = (listing) => {
    if (!listing || !listing.image || !listing.image.url) return;
    const url = listing.image.url;
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
    if (!isAbsolute) {
        listing.image.url = `/uploads/${url}`;
    }
};

module.exports.index = async(req, res)=>{
    const allListing = await Listing.find({});
    allListing.forEach(normalizeImageUrl);
    res.render('listings/index', { allListing });
};
module.exports.renderNewForm = (req, res)=>{
    res.render('listings/newListing');
};
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({path:"reviews", populate:{path:"author"}})
        .populate("owner");
    if(!listing){
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    normalizeImageUrl(listing);
    res.render('listings/show', { listing });
};
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    normalizeImageUrl(listing);
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit", { listing , originalImage});
};
module.exports.addListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    
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
    let { id } = req.params;
    let lisitng = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    lisitng.image = {url, filename};
    await lisitng.save();
    }
    req.flash('success', 'listing updated successfully!');
    res.redirect(`/listings/${id}`);
};
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', "listing deleted successfully!");
    res.redirect('/listings');
};