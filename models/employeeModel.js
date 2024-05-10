const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    designation: String,
    gender: String,
    course: String,
    file: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("employees", employeeSchema);
