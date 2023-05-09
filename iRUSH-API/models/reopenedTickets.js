const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReopenTicketSchema = Schema(
	{
		clientId: {
			type: Schema.Types.ObjectId,
			ref: "client",
			required: true,
		},
		ticketId: {
			type: Schema.Types.ObjectId,
			ref: "ticket",
			required: true,
		},
		requestNo: {
			type: String,
			required: true,
		},
		requester: {
			type: String,
			required: true,
		},
		requesterEmail: {
			type: String,
			required: true,
		},
		contactNum: {
			type: String,
			required: true,
		},
		clientUnit: {
			type: String,
			required: true,
		},
		ticketNo: {
			type: String,
			required: true,
		},
		ticketCategory: {
			type: String,
			required: true,
		},
		ticketSubject: {
			type: String,
			required: true,
		},
		ticketDescription: {
			type: String,
			required: true,
		},
		referenceNo: {
			type: String,
		},
		assignTo: {
			type: String,
		},
		priority: {
			type: String,
		},
		resolvedAt: {
			type: Date,
		},
		solutionMade: {
			type: String,
			required: true,
		},
		remarks: {
			type: String,
		},
		isAssigned: {
			type: Boolean,
			required: true,
			default: false,
		},
		issue: {
			type: String,
			required: true,
		},
		reopenedAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

const ReopenTicket = mongoose.model("reopenticket", ReopenTicketSchema);

module.exports = ReopenTicket;
