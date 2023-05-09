const express = require("express");
const router = express.Router();

const {
	register,
	addclient,
	login,
	forgotpassword,
	getresetpassword,
	resetpassword,
} = require("../controllers/auth");

const { protect, adminAuth } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotpassword);
router.route("/resetpassword/:id/verify/:token").get(getresetpassword);
router.route("/resetpassword/:id/verify/:token").post(resetpassword);
router.route("/addclient").post(protect, adminAuth, addclient);

module.exports = router;
