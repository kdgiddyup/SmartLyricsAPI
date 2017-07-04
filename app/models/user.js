var mongoose = require('mongoose');
 
var userSchema = new mongoose.Schema({
  // basic-auth-mongoose plugin will add user/pass fields
});

//To add authentication functionality, all you need to do is plugin basic-auth, and create your new User model:
userSchema.plugin(require('basic-auth-mongoose'));
var User = mongoose.model('User', userSchema);

module.exports = User;

