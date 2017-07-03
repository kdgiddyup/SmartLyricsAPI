// ==================================================
// DEPENDENCIES
//===================================================
const express=require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const app = express()  

// this is an API, so it will get requests from off-domain sources:
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

// dev tool: environment processor
require('dotenv').config();

app.use(logger("dev"));

// BodyParser makes it easy for our server to interpret data sent to it.
// The code below is pretty standard.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" })); 

// ===================================================
// ROUTES
// geniusApi routes handle requests to the Genius api.
// mongooseAPI routes handle mongoDB actions.
// htmlRoutes serves the homepage
// ===================================================

require("./api/geniusApi")(app);
require("./api/mongooseApi")(app);



// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 3000;

// ==================================================
// start our server
// ==================================================
app.listen(PORT, function() {
  console.log(`App listening on port ${PORT}`);
});
