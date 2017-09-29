const mongoose = require("mongoose");

// Create a separate db for running tests to avoid conflicts/accidental drops from production db
before(done => {
  mongoose.connect("mongodb://localhost/uber-clone-test", { useMongoClient: true});
  mongoose.connection
    .once("open", () => done())
    .on("error", err => {
      console.warn("Warning", error);
    });
});

beforeEach(done => {
  const { drivers } = mongoose.connection.collections;
  drivers.drop()
    // Indices are dropped each time & must be added back
    .then(() => drivers.ensureIndex({ "geometry.coordinates": "2dsphere" }))
    .then(() => done())
    // Include catch for the first time it's run before there is a drivers collection
    .catch(() => done())
});
