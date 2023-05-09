const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resolveTicketSchema = new Schema(
	{
		cticketId: {
			type: Schema.Types.ObjectId,
			ref: "ticket",
			required: true,
		},
		//solution made
		resolveReason: {
			type: String,
			required: true,
		},
		//remarks for the ticket
		remarks: {
			type: String,
			required: true,
		},
	},
	{
		timeStamps: true,
	}
);

const ResolveTicket = mongoose.model("resolvedTicket", resolveTicketSchema);

module.exports = ResolveTicket;
