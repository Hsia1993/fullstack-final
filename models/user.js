const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fixedSalt = "$2b$10$abcdefghijklmnopqrstuv";
const { v4 } = require("uuid");
const { Schema } = mongoose;

const carDetailSchema = new Schema({
  make: String,
  model: String,
  year: Number,
  platNo: String,
});

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  licenseNo: { type: String, unique: true },
  age: Number,
  car_detail: carDetailSchema,
  userType: String,
  testType: String,
  appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
  password: String,
  username: { type: String, unique: [true, "Username existed!"] },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.username) {
    user.username = v4();
  }
  if (!user.licenseNo) {
    user.licenseNo = v4();
  }
  try {
    if (user.isModified("licenseNo")) {
      const hash = await bcrypt.hash(user.licenseNo, fixedSalt);
      user.licenseNo = hash;
    }
    if (user.isModified("password")) {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    }
    next();
  } catch (e) {
    return next(e);
  }
});
userSchema.pre("findOne", async function (next) {
  const query = this.getQuery();
  if (query.licenseNo) {
    try {
      const licenseNo = await bcrypt.hash(query.licenseNo, fixedSalt);
      this.where({ licenseNo });
      next();
    } catch (e) {
      console.log(e);
      return next(e);
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
