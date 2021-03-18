// import mongoose
const mongoose = require("mongoose");
// import dotenv
const dotenv = require("dotenv");
dotenv.config();

// database connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log("DB Connected"));

mongoose.connection.on("error", err => {
    console.log(`DB connection error: ${err.message}`);
});