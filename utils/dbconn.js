const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/exercise_tracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

module.exports = db;
