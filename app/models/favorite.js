// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// Create a Favorite schema with the Schema class
// stores song titles and ids

var FavoriteSchema = new Schema({
  // whose favorite is this?
  user: {
    type: String
  },
  // title: a string
  title: {
    type: String,
    unique: false
  },
  artist: {
    type: String,
    unique: false
  },
  // song_id: a number
  song_id: {
    type: Number,
    unique: true
  },
  image: {
    type: String,
    unique: false
  },
  lyrics: {
    type: String,
    unique: false
  }
});

// Make a Favorite model with the Favorite schema
var Favorite = mongoose.model("Favorite", FavoriteSchema);

// Export the Favorite model
module.exports = Favorite;