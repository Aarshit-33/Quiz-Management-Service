import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
	questionText: {
		type: String,
		required: true,
	},
	options: {
		type: [String],
		required: true,
	},
	correctAnswer: {
		type: String,
		required: true,
	},
});

const quizSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	grade: {
		type: Number,
		required: true,
	}, // Grade level
	subject: {
		type: String,
		required: true,
	}, // Subject name
	totalQuestions: {
		type: Number,
		required: true,
	}, // Total number of questions
	maxScore: {
		type: Number,
		required: true,
	}, // Maximum score for the quiz
	difficulty: {
		type: String,
		enum: ["EASY", "MEDIUM", "HARD"],
		required: true,
	}, // Difficulty level
	questions: [questionSchema], // List of questions
	createdDate: {
		type: Date,
		default: Date.now,
	}, // Quiz creation date
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
