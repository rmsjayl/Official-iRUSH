require("dotenv").config({ path: "./config.env" });
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

//@desc:	MONGODB CONNECTION
const connectDB = require("./config/db");
connectDB();

//@desc:	MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//@desc:	ROUTERS
const requestservice = require("./routes/requestservice");
const reopenticket = require("./routes/reopenticket");
const auth = require("./routes/auth");
const tickets = require("./routes/tickets");
const settings = require("./routes/settings");

//@desc:	ROUTES
app.use("/api/clients", requestservice);
app.use("/api/clients", reopenticket);
app.use("/api/auth", auth);
app.use("/api/tickets", tickets);
app.use("/api/settings", settings);
app.use(express.static("./uploads"));

//@desc:	APPLICATION SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log("[v1.0.8]Server is running on port " + PORT);
});
