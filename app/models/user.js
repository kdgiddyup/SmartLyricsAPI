// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// Create a User schema with the Schema class
// stores User name and password hash

var UserSchema = new Schema({
  // user: a string
  username: {
    type: String,
    unique: true,
    validate: {
      validator: function(val){return /^[a-z0-9\_\-]+$/i.test(val);}
    }
  },
  password: {
    type: String
  }
})

// Make a User model with the User schema
var User = mongoose.model("User", UserSchema);

// Export the User model
module.exports = User;