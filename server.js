// Dependencies
const express = require("express");
const fs = require("fs");


// Sets up the express app
var app = express();
var PORT = process.env.PORT || 8080

// Sets up the express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public/assets", express.static(__dirname + "/public/assets"));


require("./routes/html-routes")(app);
require("./routes/api-routes")(app);

// Starts the server to begin listening
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});