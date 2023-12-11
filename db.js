const mongoose = require("mongoose");
const uri =
  "mongodb+srv://dongxu:jNXzmsRuyozZwaAw@cluster0.5lwvp5q.mongodb.net/";
async function run() {
  return await mongoose.connect(uri);
}

module.exports = run;
