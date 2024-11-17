import { Submission } from "../models/Submission.js";
import Quiz from "../models/Quiz.js";
import mongoose from "mongoose";

const submitQuiz = async (req, res) => {
	try {
		const { quizId, responses } = req.body;
		const quiz = await Quiz.findById(quizId);
		if (!quiz) return res.status(404).json({ message: "Quiz not found" });

		let score = 0;

		// Calculate the score
		responses.forEach((response) => {
			const question = quiz.questions.id(response.questionId);
			if (question && question.correctAnswer === response.userResponse) {
				score++;
			}
		});

		const userId = req.user.userId;
		console.log("User ID: ", req.user);

		// Find previous submissions
		const previousSubmissions = await Submission.find({
			quizId,
			userId,
		}).sort({ attemptNumber: -1 });

		let attemptNumber = 1;
		let previousScore = null;

		if (previousSubmissions && previousSubmissions.length > 0) {
			attemptNumber = previousSubmissions[0].attemptNumber + 1;
			previousScore = previousSubmissions[0].score;
		}

		// Create new submission
		const submission = new Submission({
			quizId,
			userId,
			responses,
			score,
			attemptNumber,
		});

		await submission.save();

		// Determine performance change
		let performanceChange = "first attempt";
		if (previousScore !== null) {
			if (score > previousScore) {
				performanceChange = "improved";
			} else if (score < previousScore) {
				performanceChange = "declined";
			} else {
				performanceChange = "same";
			}
		}

		res.status(200).json({
			message: "Quiz submitted successfully",
			score,
			maxScore: quiz.maxScore,
			performanceChange,
			attemptNumber,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error submitting quiz",
			error: err.message,
		});
	}
};

export { submitQuiz };
