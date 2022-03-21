const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
//Schema is just a variable to shorten mongoose.Schema, so we don't have to write it over and over again


const ImageSchema = new Schema({
    url: String,
    filename: String
});
//virtual is not not stored in the database, it simply exists on the express side of things, see docs on virtual
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
    //while, loading previously stored imgs on edit campground route, we use this virtual to generate a thumbnail of it
    //this url is coming from cloudinary
    // https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png
});

const opts = { toJSON: { virtuals: true } }; 
//By default, Mongoose does not include virtuals when you convert a document to JSON. Which is what we need (data in JSON),
//the popup we generate for cluster map is a virtual (defined below), that has link to go to each campground
//A virual is defined bcz, so that we can dynamicaly create what we need in advance on our side without having to mess with the database much
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {     //fowardgeocoding api returns data in this format
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


//The way data is associated, "campground->reviews" and "reviews->user"
//so if a review is gone, we already lose the connection to user, 
//and since our app doesn't allow users to be removed, we don't need to worry about the reverse
//BUT if a camground is gone we have to remove the associated review,
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // console.log(doc);
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
//findOneAndDelete is a mongoose middleware triggered by findByIdAndDelete() (which is being used to delete campground),
//doc is what is being deleted, in pre middleware it is empty, in post request it contains the data that was deleted

module.exports = mongoose.model('Campground', CampgroundSchema);