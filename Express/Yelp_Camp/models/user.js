const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose'); //helps when working with mongoose, check documentaion

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//The way data is associated, "campground->reviews" and "reviews->user"
//so if a review is gone, we already lose the connection to user, 
//and since our app doesn't allow users to be removed, we don't need to worry about the reverse
//BUT if a camground is gone we have to remove the associated review,

UserSchema.plugin(passportLocalMongoose);   //This will add on password, username and some methods onto our schema by itself

module.exports = mongoose.model('User', UserSchema);