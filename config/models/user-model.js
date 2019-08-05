var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
    googleID: String,
    fullname: String,
    bookmarks: Array
});

var User = mongoose.model('user', userSchema);

module.exports = User;