const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const app = express();
const mongoose = require("mongoose")

mongoose.Promise = global.Promise;
// Must use different dbs for Mocha tests to avoid dropping data from production db
if(process.env.NODE_ENV !== "test") {
  mongoose.connect("mongodb://localhost/uber-clone", { useMongoClient: true});
}

app.use(bodyParser.json());
routes(app);

// Error handling -> middleware to prevent hanging server requests
// Status 422 is a request that can't be handled, i.e. validation error
app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message });
});

module.exports = app;
