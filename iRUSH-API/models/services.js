const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ServiceRequestSchema = mongoose.Schema(
	{
		clientId: {
			type: Schema.Types.ObjectId,
			ref: "client",
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
		clientUnit: {
			type: String,
			required: true,
		},
		clientContact: {
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
		referenceNo: {
			type: String,
		},
		attachments: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const Service = mongoose.model("service", ServiceRequestSchema);

module.exports = Service;
