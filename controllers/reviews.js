const Review = require('../models/review');
const Listing = require('../models/listing');

module.exports.createReview = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newreview = new Review(req.body.review);
    newreview.author = req.user._id;
    listing.reviews.push(newreview);    
    await newreview.save();
    await listing.save();

    req.flash('success', 'New review submitted successfully!');
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
};

module.exports.updateReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Review.findByIdAndUpdate(reviewId, { ...req.body.review });

    req.flash('success', 'Review updated successfully!');
    res.redirect(`/listings/${id}`);
};