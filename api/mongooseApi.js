// allow requests from all domains
var cors = require("cors");

// we'll need our mongo models
//var Favorite = require("../app/models/favorite.js");
var User = require("../app/models/user.js");

module.exports = function(app) {
  
  // Route to save our favorited song to mongoDB via mongoose
  app.post("/api/favorite/:user", function(req, res) {
  
    // favorite object (req.body) looks like:  
    // {"title":"","artist":"","song_id":"","image":"","lyrics":""}

    // Save new "Favorite" object to mongoDB by adding to the User's favorite's array:
    // 1. Find the user by the passed in user parameter
    // 2. push the req.body object to this user's favorites field (an array)
    // 3. sort the array asc ("1") by the artist field 
    // 4. send error or success message back to client 
    User.findOneAndUpdate(
      { username: req.params.user }, 
      { $push: { favorites: { $each: [req.body], $sort: {"artist":1} } } },
      { upsert: true, new:true },
      function( error, doc) {
      // Send any errors to the browser
      if (error) {
        res.json({
          success:false,
          message: error
        });
      }
      // Otherwise, send success and song object back
      else {
        res.json(
            {
            success: true,
            song : req.body
          })
      }
    });
  });

// Route to retrieve and show user's favorited articles
app.get("/api/favorites/:user", function(req,res){
    // retrieve favorites of currently logged-in user, passed through as a query parameter
    User.findOne({ username:req.params.user }, "favorites", function(err, found){
      if(err){
        console.log("error:",err);
        res.json({success:false,message:err});
      }
      else{

        if (found === null) 
          found=[];
        // when data is present, found looks like:  [{"artist":"","favorite":"","image":"","lyrics":"","song_id":"","title":""}, ... ]
        res.json({success:true,data:found});
      }
    });
});

// Route to remove favorited song
app.get("/api/remove/:user/:id", function(req,res){

  console.log(`attempting to remove ${req.params.id} for user ${req.params.user}`);

  // we find our user and update their favorites array using the $pull operator:
  User.findOneAndUpdate({ username: req.params.user }, {$pull: { "favorites" : {"song_id":req.params.id} } }, function(err){
    if (err) {
      res.json({
        success:false,
        message:err
      });
    };
    res.json({
      success:true,
      song:req.params.id
    });
   });
});

// Save new user to mongoDB
    app.post("/api/signup", function(req, res){
        console.log("sign up route hit");
        var newUser = new User(req.body);
        console.log("new user:",newUser);
        newUser.save(function(error,user){
            if (error) {
                if (error.code == 11000) {
                  var message = "That username already exists. Try again!"
                };
                res.json({
                    "success":false,
                    "message": message 
                })
            }
            else { 
                console.log("Success",user.username);
                res.json({
                    "success":true,
                    "user":req.body.username,
                    "message":`Welcome, ${req.body.username}`
                })
            }
        })
    }); // end signup post route

// log-in user
    app.post("/api/login",function(req,res){
      console.log("login route, getting:",req.body);
      User.findOne({'username' : req.body.username}, function (err, user) {
      if (err) console.log(err)
      else {
          if (!user) {
            res.json({
              "success":false,
              "message": "Unable to log you in. Try again!"            
              })
          }
          else if (user.authenticate(req.body.password)) {
              res.json({
                "success":true,
                "user":req.body.username,
                "message":`Welcome, ${req.body.username}`
              })
            } 
          else
              res.json({
                "success":false,
                "message":"Unable to log you in. Try again."})
          }
      });
    });
};
