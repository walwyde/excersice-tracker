const mongoose = require("mongoose");

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return mongoose.connection;
  } catch (ex) {
    console.log(ex);
  }
};

module.exports = connectdb;
