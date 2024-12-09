const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://ankitupadhyay4519:5vacK5344gBY0BrN@namastenode.xrfjt.mongodb.net/devTinder"
  );
};

module.exports = connectDB;

