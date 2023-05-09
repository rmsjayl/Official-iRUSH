const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const joi = require("joi");

const solutionSchema = new Schema(
	{
		solutionName: {
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

const Solution = mongoose.model("solution", solutionSchema);

module.exports = Solution;
