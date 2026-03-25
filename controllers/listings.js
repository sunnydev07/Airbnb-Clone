const Listing = require('../models/listing');

module.exports.index = async(req, res)=>{
    const allListing = await Listing.find({});
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
    res.render('listings/show', { listing });
};
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
};
module.exports.addListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'new listing created!');
    res.redirect('/listings');
};
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
};
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', "listing deleted successfully!");
    res.redirect('/listings');
};