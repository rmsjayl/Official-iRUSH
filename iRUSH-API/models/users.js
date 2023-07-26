const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    contactNum: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: [
        "USER_ADMIN",
        "USER_SUPERADMIN",
        "CLERK_HELPDESKSUPPORT",
        "CLERK_ITSUPPORT",
      ],
      default: "CLERK_ITSUPPORT",
    },
    rateSLA: {
      type: Number,
      required: true,
      default: 0,
    },
    resolvedTickets: {
      type: Number,
      default: 0,
    },
    averageResolutionTime: {
      type: String,
      default: "0d, 0h, 0m, 0s",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", UserSchema);

const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().min(2).max(25).label("First Name"),
    lastName: Joi.string().required().min(2).max(15).label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    contactNum: Joi.string()
      .length(11)
      .regex(/^\d+$/)
      .required()
      .label("Mobile Number"),
    password: passwordComplexity().required().label("Password"),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm Password")
      .message({ "any.only": "Passwords do not match" }),
    role: Joi.string().required().label("Role"),
  });
  return schema.validate(data);
};

module.exports = { User, validate };
