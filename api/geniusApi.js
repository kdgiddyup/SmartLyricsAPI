var axios = require("axios");
var cors = require("cors");

// this will change depending on environment
var resourceHost = process.env.DEV_API || "https://smartlyricsapi.herokuapp.com";
//var resourceHost = "http://localhost:3002";

// scraping tools
// get html from URLs
var request = require("request-promise");

// Scrapes our HTML
var cheerio = require("cheerio");

// Genius api routes
var api = require('genius-api');
var genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);



module.exports = function(app) {

// post request to search songs; using post because text entry might be lengthy
  app.post("/api/search", function(req, res) {
   console.log(`hit search route at ${process.env.PORT}`);
    if (req.body.input === "")
      res.json({
        "success":false,
        "message":"Your search request was blank. Try again!",
        code:400})
    else {
      genius.search(req.body.input).then(function(response) {
        // Genius limits response to max 10
        var raw = response.hits;

        // we'll push our parsed song data into this array
        var songs = [];

        // get all of this user's favorite songs
        // 
        axios.get(`${resourceHost}/api/favorites/${req.body.user}`)
            .then(function(favsData){

              // we only want the favorites array part of the returned object
              favorites=favsData.data.data.favorites;
              var favorite = "";
              // loop through each element of genius api response to format results, including adding a 'favorite' status based on a match with user favorites 
                for (var i=0; i<raw.length; i++) {
                  
                  // loop through this user's favorites
                  for (var j=0; j<favorites.length;j++){
                    //raw[i].result.favorite = "";
                  
                    if (Number(raw[i].result.id) === Number(favorites[j].song_id)) {
                      favorite = "favorite";
                    }
                  } // end user favorites loop
                  
                  //add this song, with updated favorite status, to songs array 
                  songs.push({
                    title: raw[i].result.title,
                    song_id: raw[i].result.id,
                    image: raw[i].result.song_art_image_thumbnail_url,
                    lyrics: raw[i].result.url,
                    artist: raw[i].result.primary_artist.name,
                    favorite: favorite
                });

                // reset favorite flag
                favorite = "";

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

      const lyricsHTML = $(".lyrics").html();
      
      // error?
      if (lyricsHTML === "" || !lyricsHTML) {
        res.json({
          "success":false,
          "message":"There was a problem fetching lyrics for this song."
        })
      }
      else {
      // lyrics will be text and additional info, so let's make it an object
      res.json({
        "success":true,
        "response": {
          "title": req.body.title,
          "artist": req.body.artist,
          "image": req.body.image,
          "lyrics": lyricsHTML
          }
        })
      };
    })
  })
}