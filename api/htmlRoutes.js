var path = require("path");

module.exports = function(app) {


    /* GET Home Page */
	app.get("/", function(req, res){
		res.sendFile(path.join(__dirname, "../app/public/home.html"));
	});
}


