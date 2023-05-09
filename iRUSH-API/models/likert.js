const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikertSchema = Schema(
	{
		clientId: {
			type: Schema.Types.ObjectId,
			ref: "client",
			required: true,
		},
		rating: {
			type: String,
			required: true,
			enum: ["Excellent", "Good", "Poor", "Bad"],
		},

		date: {
			type: Date,
			default: Date.now(),
		},
	},
	{
		timestamps: true,
	}
);

const Likert = mongoose.model("likert", LikertSchema);

module.exports = Likert;
