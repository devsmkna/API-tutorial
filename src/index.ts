import express from "express";
import mongoose from "mongoose";
import path from "path";

// import routes
import companies from "./routes/companies";
import auth from "./routes/auth";

// .env setup
require("dotenv").config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV?.trim()}`) });

// Create app
const app = express();
app.use(express.json());

// Setup routes
app.use("/companies", companies);
app.use("/auth", auth);


const run = async () => {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.DB_URL as string)
        .then(() => console.log("Connected to MongoDB Atlas"))
        .catch((err) => console.log(`Could not connect to MongoDB Atlas: ${err}`));
    
    // Start server
    app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));
}

run();

export default app;