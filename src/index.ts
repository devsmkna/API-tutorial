import express from "express";
import mongoose from "mongoose";

// import routes
import users from "./routes/users";
import auth from "./routes/auth";

// Create app
const app = express();
app.use(express.json());

// port
const port = 3000;

// Connect to MongoDB Atlas
const psw = "UdM5M9AV4TVccVxH";
const account = "davidevisco";
const cluster = "deuscluster";
mongoose.connect(`mongodb+srv://${account}:${psw}@${cluster}.eaqng7v.mongodb.net/`)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((e) => console.log(`Could not connect to MongoDB Atlas: ${e}`));

// Setup routes
app.use("/users", users);
app.use("/auth", auth);

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));