const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rejectReasonSchema = new Schema(
	{
		rejectReasonName: {
			type: String,
			required: true,
		},

		description: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const RejectReason = mongoose.model("rejectreason", rejectReasonSchema);

module.exports = RejectReason;
