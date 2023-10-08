const mongoose = require("mongoose");

const connectdb = async () => {
  try {
    const connected = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connected.connection.on(
      "error",
      console.error.bind(console, "connection error:")
    );
    connected.connection.once("open", function () {
      console.log("Connected to the database!");
    });

  } catch (ex) {
    console.log(ex);
    process.exit(1);
  }
};

module.exports = connectdb;
