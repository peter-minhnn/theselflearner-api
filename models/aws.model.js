const mongoose = require("mongoose");
const Classes = mongoose.model(
  "Aws",
  new mongoose.Schema({
    accessKeyId: String,
    secretAccessKey: String
  }, 
  { strict: true }),
  'aws'
);

module.exports = Classes;
