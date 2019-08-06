var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stuff = new Schema({
    title: String,
    link: String,
    image: String
});

var userSchema = new Schema({
    googleID: String,
    fullname: String,
    bookmarks: [[String, String, String]]
});

var User = mongoose.model('user', userSchema);

module.exports = User;