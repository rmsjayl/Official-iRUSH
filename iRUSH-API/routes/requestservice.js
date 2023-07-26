const express = require("express");
const router = express.Router();

const {
  requestservice,
  getcreateticket,
  postcreateticket,
  getClientRequest,
  requestservicesuccess,
} = require("../controllers/requestservice");

const upload = require("../middleware/upload");

router
  //route
  .route("/requestservice")
  //method
  .post(requestservice);

router.route("/requestservicesuccess/:id").get(requestservicesuccess);

router
  //routes
  .route("/clientrequest/:id/request/:token")
  //method
  .get(getcreateticket)
  .post(upload.single("attachments"), postcreateticket);

router
  //routes
  .route("/clientrequest/:id")
  //method
  .get(getClientRequest);

module.exports = router;
