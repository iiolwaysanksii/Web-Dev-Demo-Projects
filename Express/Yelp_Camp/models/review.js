const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

//The way data is associated, "campground->reviews" and "reviews->user"
//so if a review is gone, we already lose the connection to user, 
//and since our app doesn't allow users to be removed, we don't need to worry about the reverse
//BUT if a camground is gone we have to remove the associated review,

module.exports = mongoose.model("Review", reviewSchema);

