const mongoose = require("mongoose");

const connectDB = async () => {
	await mongoose.connect(process.env.MONGODB_URI, {
		useNewUrlparser: true,
		useUnifiedTopology: true,
	});

	console.log("MongoDB connection successfully established...");
};

module.exports = connectDB;
