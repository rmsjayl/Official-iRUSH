const mongoose = require("mongoose");
const RespondTokenSchema = mongoose.Schema({
	clientId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "client",
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

RespondTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });
const RespondToken = mongoose.model("respondtoken", RespondTokenSchema);

module.exports = RespondToken;
