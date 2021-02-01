const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");

// environment variables
dotenv.config({ path: "./config/config.env" });

// connect to MongoDB
connectDB();

// load routes
const bootcamps = require("./routes/bootcamps");

const app = express();

// middleware
app.use(express.json());

// dev logging only
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// mount routes
app.use("/api/v1/bootcamps", bootcamps);

// start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// handle unhandled promise rejections
process.on("unhandledRejection", (error, promise) => {
  console.log(`Error: ${error.message}`.red.bold);
  server.close(() => process.exit(1));
});
