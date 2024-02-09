import express from "express";
import mongoose from "mongoose";
import path from "path";

// import routes
import companies from "./routes/companies";
import auth from "./routes/auth";

// .env setup
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Create app
const app = express();
app.use(express.json());

// port
const PORT = 3000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.DBURL as string)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((e) => console.log(`Could not connect to MongoDB Atlas: ${e}`));

// Setup routes
app.use("/companies", companies);
app.use("/auth", auth);

// Start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));