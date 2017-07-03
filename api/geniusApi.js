// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

var path = require("path");
// scraping tools
// get html from URLs
var request = require("request-promise");

// Scrapes our HTML
var cheerio = require("cheerio");

// Genius api routes
var api = require('genius-api');
var genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);



module.exports = function(app) {
app.get("/", function(req,res){

}) 
// post request to search lyrics; using post because text entry might be lengthy
  app.post("/api/search/", function(req, res) {
    if (req.body.input === "")
      handleError(res, "Invalid input", "Must provide search terms.", 400);
    else {
      genius.search(req.body.input).then(function(response) {
        // Genius limits response to max 10
        var raw = response.hits;

        // we'll push our parsed song data into this array
        var songs = [];

        // loop through each element of response
        for (var i=0;i<raw.length;i++){
          var song = raw[i].result;
          songs.push({
            title: song.title,
            song_id: song.id,
            thumb: song.song_art_image_thumbnail_url,
            lyrics: song.url,
            artist: song.primary_artist.name
          });
          
        }; // end songs for loop
    // send songs object back to front end 
    res.json({songs});
      })
      .catch(function(error) {
        console.error(error)
      });  // end genius api call
    } // end api route's 'else' block 
  });

  // search for annotations on lyrics panels
  app.get("/api/annotation/:id", function(req, res) {
    genius.annotation(req.params.id,{text_format:"html"})
    .then(function(response){
      res.json(response);
    });
  })

// lyrics scraping route
app.post("/api/lyrics", function(req,res){
  //lyric scraping happens here
  var urlSource = req.body.url;

  var options = {
      uri: urlSource,
      transform: function (body) {
          return cheerio.load(body);
      }
  };
  request(options).then(function ($) {
      // lyrics will be text and additional info, so let's make it an object
      var lyrics = {
        title: req.body.title,
        artist: req.body.artist,
        image: req.body.image
      };
      lyrics.text = $(".lyrics").html();
      res.json(lyrics);
    })
    .catch(function (err) {
        handleError(res, "Problemw with resource", "Could not return lyrics", 400); 
    });

});


};
