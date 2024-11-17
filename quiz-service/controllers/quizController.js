import Quiz from "../models/Quiz.js";
import { Submission } from "../models/Submission.js";
import { getUser } from "../helpers/getUser.js";

//

const generateQuestions = async (
	title,
	grade,
	subject,
	totalQuestions,
	difficulty
) => {
	// Fetch questions from the api call
	const response = await fetch(
		"http://ai_microservice:5000/generate-questions",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title,
				grade,
				subject,
				difficulty,
				totalQuestions,
			}),
		}
	);

	const data = await response.json();

	console.log("Data: ", data);
	console.log("Data quea: ", data.questions);

	// if (data.error) {
	// 	throw new Error(data.error);
	// }

	return data.questions;
};

// Create a new quiz
const createQuiz = async (req, res) => {
	try {
		const {
			title,
			grade,
			subject,
			totalQuestions,
			maxScore,
			difficulty,
			// questions,
		} = req.body;

		// Generate questions

		let questions = [];

		questions = await generateQuestions(
			title,
			grade,
			subject,
			totalQuestions,
			difficulty
		);

		// questions.json();
		console.log("Questions: ", questions);

		// check type of questions

		// convert a question in to json object
		questions = JSON.parse(questions);

		if (typeof questions === "string") {
			return res.status(400).json({
				message: "it is a string",
				error: questions,
			});
		}
		// console.log("Questions: ", questions);

		const newQuiz = await new Quiz({
			title,
			grade,
			subject,
			totalQuestions,
			maxScore,
			difficulty,
			questions,
		});

		const savedQuiz = await newQuiz.save();
		res.status(201).json({
			message: "Quiz created successfully",
			quiz: savedQuiz,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error creating quiz",
			error: err.message,
		});
	}
};

// Get quiz submission history for a user
const getQuizHistory = async (req, res) => {
	try {
		let { userId } = req.user; // Extract from JWT

		const { user, grade, subject, marks, from, to } = req.query;

		// find user id from username
		if (user) {
			// console.log("User: ", user);
			let userData = await getUser(user);
			userData = userData[0];
			if (userData == null) {
				return res.status(404).json({ message: "User not found" });
			}

			userId = userData._id;
		}

		// Build filter object based on available query params
		let filters = { userId }; // Filter by userId to get quizzes of logged-in user only
		// console.log("Filters: ", filters);

		const submission = await Submission.find(filters);

		// now let us find all quizzes that the user has taken
		let quizzes = await Quiz.find({
			_id: { $in: submission.map((sub) => sub.quizId) },
		});

		// // apply filters to quizzes
		if (grade) {
			quizzes = quizzes.filter((quiz) => quiz.grade == parseInt(grade));
		}

		if (subject) {
			quizzes = quizzes.filter((quiz) => quiz.subject == subject);
		}

		if (marks) {
			quizzes = quizzes.filter(
				(quiz) => quiz.maxScore >= parseInt(marks)
			);
		}

		if (from || to) {
			quizzes = quizzes.filter((quiz) => {
				if (from && to) {
					return (
						new Date(from) <= new Date(quiz.createdDate) &&
						new Date(to) >= new Date(quiz.createdDate)
					);
				} else if (from) {
					return new Date(from) <= new Date(quiz.createdDate);
				} else {
					return new Date(to) >= new Date(quiz.createdDate);
				}
			});
		}

		// // Send response

		if (!quizzes.length) {
			return res.status(404).json({
				message: "No quiz history found with the given filters.",
			});
		}

		res.status(200).json({
			message: "Quiz history retrieved successfully.",
			quizzes,
		});
	} catch (error) {
		console.error("Error retrieving quiz history:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Retry a quiz
const getQuizForRetry = async (req, res) => {
	try {
		const { quizId } = req.params;
		const quiz = await Quiz.findById(quizId);
		if (!quiz) return res.status(404).json({ message: "Quiz not found" });

		const userId = req.user._id;

		// Get previous submissions
		const previousSubmissions = await Submission.find({
			quizId,
			userId,
		}).sort({ attemptNumber: -1 });

		res.status(200).json({
			message: "Quiz retrieved successfully",
			quiz,
			previousSubmissions,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error retrieving quiz",
			error: err.message,
		});
	}
};

export { createQuiz, getQuizHistory, getQuizForRetry };
