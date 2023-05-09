const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RejectedServiceRequestSchema = mongoose.Schema(
	{
		serviceId: {
			type: Schema.Types.ObjectId,
			ref: "service",
			required: true,
		},
		clientId: {
			type: Schema.Types.ObjectId,
			ref: "client",
			required: true,
		},
		referenceNo: {
			type: String,
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
		clientContact: {
			type: String,
			required: true,
		},
		clientUnit: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		subject: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		rejectedtedReason: {
			type: String,
			required: true,
		},
		remarks: {
			type: String,
			required: true,
		},
		requestedAt: {
			type: Date,
			required: true,
		},
		rejectedAt: {
			type: Date,
			required: true,
		},
		rejectedBy: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const RejectedService = mongoose.model(
	"rejectedservice",
	RejectedServiceRequestSchema
);

module.exports = RejectedService;
