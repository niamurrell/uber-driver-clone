const assert = require("assert");
const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
// Need to include the model itself not the reference to the model, because Mongoose doesn't work well with Mocha...this avoids declaring the model twice.
const Driver = mongoose.model("driver");

describe("Drivers controller", () => {
  it("POST to /api/drivers creates a new driver", done => {
    // Count # drivers in db before test
    Driver.count().then(count => {
      // User supertest to make HTTP request (and all following request() -s)
      request(app)
        .post("/api/drivers")
        .send({ email: "test@test.com" }) // add new driver
        .end(() => {
          // Test count of drivers has increased by 1
          Driver.count().then(newCount => {
            assert(count + 1 === newCount);
            done();
          })
        });
      // 3 options to test success: 1, send newest driver back to user as confirmation; 2, test that the new user is in the database; 3, look at the number of drivers before and after the action and assert there is one more. This code is an example of #3...maybe not the best way to go about it but shown for example
    });
  });

  it("PUT to /api/drivers/id edits an existing driver", done => {
    // Create new driver
    const driver = new Driver({ email: "t@t.com", driving: false });
    driver.save().then(() => {
      request(app)
        .put("/api/drivers/" + driver._id)
        .send({ driving: true }) // edit field
        .end(() => {
          Driver.findOne({ email: "t@t.com" })
            .then(driver => {
              assert(driver.driving === true);
              done();
            });
        });
    });
  });

  it("DELETE to /api/drivers/id deletes an existing driver", done => {
    const driver = new Driver({ email: "r@r.com", driving: true });
    driver.save().then(() => {
      request(app)
        // ES6 version of line 31 above
        .delete(`/api/drivers/${driver._id}`)
        .end(() => {
          Driver.findOne({ email: "r@r.com" })
            .then(driver => {
              assert(driver === null);
              done();
            });
        });
    });
  });

  it("GET to api/drivers finds a driver's location", done => {
    const seattleDriver = new Driver({
      email: "seattle@test.com",
      geometry: { type: "Point", coordinates: [-122.4759902, 47.6147628] }
    });

    const miamiDriver = new Driver({
      email: "miami@test.com",
      geometry: { type: "Point", coordinates: [-80.253, 25.791] }
    });

    Promise.all([ seattleDriver.save(), miamiDriver.save()])
      .then(() => {
        request(app)
          .get("/api/drivers?lng=-80&lat=25")
          // Should return the nearer driver to this long/lat
          .end((err, response) => {
            assert(response.body.length === 1); // Should return 1 driver
            assert(response.body[0].obj.email === "miami@test.com");
            done();
          });
      });
  });
});
