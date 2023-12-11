const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  start: {
    type: Date,
  },
  end: {
    type: Date,
  },
  testType: {
    type: String,
    enum: ["G2", "G"],
    default: "G2",
  },
  isAvailable: Boolean,
  comment: String,
  passed: Boolean,
  examiner: { type: Schema.Types.ObjectId, ref: "User" },
  driver: { type: Schema.Types.ObjectId, ref: "User" },
  creator: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
