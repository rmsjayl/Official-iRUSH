const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
	{
		categoryName: {
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

const Category = mongoose.model("category", CategorySchema);

module.exports = Category;
