import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
	questionId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Quiz.questions",
		required: true,
	},
	userResponse: { type: String, required: true },
});

const submissionSchema = new mongoose.Schema({
	quizId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Quiz",
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	responses: [responseSchema],
	score: { type: Number, required: true },
	completedDate: { type: Date, default: Date.now },
	attemptNumber: { type: Number, required: true }, // New field to track attempts
});

const Submission = mongoose.model("Submission", submissionSchema);

export { Submission };
