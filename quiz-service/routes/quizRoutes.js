import { verifyToken } from "../middleware/auth.js";
import {
	createQuiz,
	getQuizHistory,
	getQuizForRetry,
} from "../controllers/quizController.js";
import { submitQuiz } from "../controllers/submissionController.js";
import express from "express";

// Create a new router
const router = express.Router();

// Create a new quiz
router.post("/create", verifyToken, createQuiz);

// Submit quiz answers and evaluate score
router.post("/submit", verifyToken, submitQuiz);

// Get quiz history for the authenticated user
router.get("/history", verifyToken, getQuizHistory);

router.get("/retry/:quizId", verifyToken, getQuizForRetry);

// Export the router
export default router;
