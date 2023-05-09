const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TicketSchema = new mongoose.Schema(
	{
		requesterId: {
			type: Schema.Types.ObjectId,
			ref: "client",
			required: true,
		},
		serviceId: {
			type: Schema.Types.ObjectId,
			ref: "service",
			required: true,
		},
		ticketNo: {
			type: String,
			required: true,
		},
		requestedAt: {
			type: Date,
			required: true,
		},
		clientUnit: {
			type: String,
			required: true,
		},
		clientContactNum: {
			type: String,
			required: true,
		},
		assignBy: {
			type: String,
			ref: "user",
			required: true,
		},
		assignTo: {
			type: String,
			ref: "user",
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
		requester: {
			type: String,
			required: true,
		},
		requesterName: {
			type: String,
			required: true,
		},
		priority: {
			type: String,
			enum: ["High", "Mid", "Low" || "high", "mid", "low"],
			default: "Low",
		},
		status: {
			type: String,
			default: "Open",
		},
		isOverdue: {
			type: Boolean,
			default: false,
		},
		isReopened: {
			type: Boolean,
			default: false,
		},
		issue: {
			type: String,
		},
		remarks: {
			type: String,
		},
		rejectReason: {
			type: String,
		},
		voidReason: {
			type: String,
		},
		solution: {
			type: String,
		},
		resolvedAt: {
			type: Date,
		},
		voidedAt: {
			type: Date,
		},
		rejectedAt: {
			type: Date,
		},
		reopenedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

TicketSchema.methods.priorityStatus = function () {
	if (this.priority === "High") {
		return this.priority + " - " + "Shall be addressed within 1 day.";
	} else if (this.priority === "Mid") {
		return this.priority + " - " + "Shall be addressed within 3 days.";
	} else if (this.priority === "Low") {
		return this.priority + " - " + "Shall be addressed within 7 days.";
	}
};

const Ticket = mongoose.model("ticket", TicketSchema);
module.exports = Ticket;
