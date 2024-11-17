import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import quizRoutes from "./routes/quizRoutes.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use("/api/quiz", quizRoutes);

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Failed to connect to MongoDB", err));

// Start the server
app.listen(process.env.PORT || 5002, () => {
	console.log(`Quiz Microservice is running on port ${process.env.PORT}`);
});
