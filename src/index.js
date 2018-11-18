const express = require("express");
const bodyParser = require("body-parser");

const battle = require("./routes/battle.route"); // Imports routes for the battles
const app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
let dev_db_url = "mongodb://someuser:abcd1234@ds261253.mlab.com:61253/battledb";
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", battle);
let port = 8080;

app.get("/", (req, res) => res.send("Hello Ragini!"));

app.listen(port, () => {
  console.log("Server is up and running on port numner " + port);
});
