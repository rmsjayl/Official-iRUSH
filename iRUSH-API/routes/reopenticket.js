const express = require("express");
const router = express.Router();

const {
	requestreopenticket,
	getrequestedtickets,
	getreopenticket,
	reopenticket,
} = require("../controllers/reopenticket");

router
	//routes
	.route("/requestreopenticket")
	//method
	.post(requestreopenticket);

router
	//routes
	.route("/client/:id/:token/requestedtickets")
	//method
	.get(getrequestedtickets);

router
	//routes
	.route("/client/:id/:token/requestedtickets/:ticketId")
	//method
	.get(getreopenticket)
	.post(reopenticket);

module.exports = router;
