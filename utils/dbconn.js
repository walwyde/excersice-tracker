const mongoose = require("mongoose");

mongoose.connect("process.env.MONGO_URI", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

module.exports = db;
