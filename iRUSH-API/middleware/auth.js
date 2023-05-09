const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/users");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization
    // req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //@desc:    GET TOKEN FROM HEADER
      token = req.headers.authorization.split(" ")[1];

      //@desc:    VERIFY THE TOKEN
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //@desc:    GET THE USER'S TOKEN
      req.user = await User.findById(decoded.id);

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Access denied! Authorization token is not valid.");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error(
      "Access denied! You are not authorized to access this pages."
    );
  }
});

//@desc:	CHECK WHETHER THE USER IS ADMIN OR NOT, IF ADMIN PROCEED TO ADMIN ROUTE
const adminAuth = async (req, res, next) => {
  try {
    if (
      req.user.role === "CLERK_HELPDESKSUPPORT" ||
      req.user.role === "CLERK_ITSUPPORT"
    ) {
      return res.status(401).send({
        success: false,
        message: "Access denied! You are not authorized to access this route.",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	CHECK WHETHER THE USER IS CLERK_HELPDESKSUPPORT ROLE
const clerkHelpdeskSupport = async (req, res, next) => {
  try {
    if (
      req.user.role === "USER_SUPERADMIN " ||
      req.user.role === "USER_ADMIN" ||
      req.user.role === "CLERK_ITSUPPORT"
    ) {
      return res.status(401).send({
        success: false,
        message: "Access denied! You are not authorized to access this route.",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

//@desc:	CHECK WHETHER THE USER IS CLERK_ITSUPPORT ROLE
const clerkITSupport = async (req, res, next) => {
  try {
    if (
      req.user.role === "USER_SUPERADMIN " ||
      req.user.role === "USER_ADMIN" ||
      req.user.role === "CLERK_HELPDESKSUPPORT"
    ) {
      return res.status(401).send({
        success: false,
        message: "Access denied! You are not authorized to access this route.",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

const servicerequestAuth = async (req, res, next) => {
  try {
    if (req.user.role === "CLERK_ITSUPPORT") {
      return res.status(401).send({
        success: false,
        message: "Access denied! You are not authorized to access this route.",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

module.exports = {
  protect,
  adminAuth,
  clerkHelpdeskSupport,
  clerkITSupport,
  servicerequestAuth,
};
