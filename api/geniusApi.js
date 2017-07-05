// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

var axios = require("axios");

// scraping tools
// get html from URLs
var request = require("request-promise");

// Scrapes our HTML
var cheerio = require("cheerio");

// Genius api routes
var api = require('genius-api');
var genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);



module.exports = function(app) {

// post request to search lyrics; using post because text entry might be lengthy
  app.post("/api/search", function(req, res) {
    if (req.body.input === "")
      handleError(res, "Invalid input", "Must provide search terms.", 400);
    else {
      genius.search(req.body.input).then(function(response) {
        // Genius limits response to max 10
        var raw = response.hits;

        // we'll push our parsed song data into this array
        var songs = [];

        // get all of this user's favorite songs
        axios.get(`/api/favorites/${req.body.user}`)
            .then(function(favorites){
              
              // loop through each element of response to format results, including comparing 'favorite' status of any songs
                for (var i=0; i<raw.length; i++) {
                  var searchSong = raw[i].result;
                
                    // loop through this user's favorites
                    for (var j=0; j<favorites.length;j++){
                      if (searchSong.id == favorites[j].song_id)
                        searchSong.favorite = "favorite"
                      else
                        searchSong.favorite="";
                    } // end use favorites loop
                  
                  //add this song, with updated favorite status, to songs array 
                  songs.push({
                    title: searchSong.title,
                    song_id: searchSong.id,
                    thumb: searchSong.song_art_image_thumbnail_url,
                    lyrics: searchSong.url,
                    artist: searchSong.primary_artist.name,
                    favorite: searchSong.favorite
                });
                } // end search result loop

                // send updated array out to front end      
                res.json({songs})
                  })
                  .catch(function (error) {
                      console.log(error);
              });          
      }) // end genius search api call
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
