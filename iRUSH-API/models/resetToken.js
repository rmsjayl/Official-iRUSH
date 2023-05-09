const mongoose = require("mongoose");
const resetTokenSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

resetTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });
const ResetToken = mongoose.model("resettoken", resetTokenSchema);

module.exports = ResetToken;
