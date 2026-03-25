const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const DEFAULT_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s";

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: DEFAULT_IMAGE,
            set: (v) => v === "" ? DEFAULT_IMAGE : v
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
});
listingSchema.post("findOneAndDelete", async(listing)=>{   // it's a middleware that call when we use findByIdAndDelete method
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});  // delete the all reviews connected to that listing page
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;