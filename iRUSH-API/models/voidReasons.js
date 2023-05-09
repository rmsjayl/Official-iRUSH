const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voidReasonSchema = new Schema(
	{
		voidReasonName: {
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

const VoidReason = mongoose.model("voidreason", voidReasonSchema);

module.exports = VoidReason;
