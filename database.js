const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const MONGODB_URI = `mongodb://${encodeURIComponent(
  "tsnullp"
)}:${encodeURIComponent(
  "xotjr313#!#"
)}@124.57.134.137:21210/?authSource=seller`;

module.exports = function async() {
  try {
    mongoose.connect(MONGODB_URI, {
      dbName: "seller",
      useNewUrlParser: true,
      // useCreateIndex: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
    });

    mongoose.connection.on("connected", function () {
      console.log(`Mongoose default connection is open to `);
    });
    mongoose.connection.on("error", function (err) {
      console.log(`Mongoose default connection has occured - ${err}`);
    });
    mongoose.connection.on("disconnected", function () {
      console.log("Mongoose default connection is disconnected ");
      mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        autoReconnect: true,
        useUnifiedTopology: true,
      });
    });
  } catch (e) {
    console.log("Failed connection to MONGO DATABASE");
    console.error(e.message);
  }
};
