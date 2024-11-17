const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_REFRESH_SECRET =
	process.env.JWT_REFRESH_SECRET || "your_refresh_jwt_secret_key";

// Helper to create tokens
const createToken = (user, type = "access") => {
	const secret = type === "access" ? JWT_SECRET : JWT_REFRESH_SECRET;
	const expiresIn = type === "access" ? "1h" : "7d"; // Access token expires in 1 hour, refresh token in 7 days
	return jwt.sign({ userId: user._id }, secret, { expiresIn });
};

// Register user
exports.register = async (req, res) => {
	const { username, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, password: hashedPassword });
		await user.save();

		// Create tokens
		const accessToken = createToken(user, "access");
		const refreshToken = createToken(user, "refresh");

		// Save refresh token in database
		user.refreshToken = refreshToken;
		await user.save();

		res.status(201).json({
			message: "User registered successfully",
			accessToken,
			refreshToken,
		});
	} catch (err) {
		res.status(400).json({
			message: "Error registering user",
			error: err.message,
		});
	}
};

// Login user
exports.login = async (req, res) => {
	const { username, password } = req.body;

	try {
		const user = await User.findOne({ username });
		if (!user)
			return res.status(400).json({ message: "Invalid credentials" });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		// Create tokens
		const accessToken = createToken(user, "access");
		const refreshToken = createToken(user, "refresh");

		// Save refresh token in database
		user.refreshToken = refreshToken;
		await user.save();

		res.status(200).json({
			message: "Login successful",
			accessToken,
			refreshToken,
		});
	} catch (err) {
		res.status(400).json({
			message: "Error logging in",
			error: err.message,
		});
	}
};

// Logout user
exports.logout = async (req, res) => {
	const { refreshToken } = req.body;

	try {
		if (!refreshToken)
			return res
				.status(400)
				.json({ message: "No refresh token provided " });

		const user = await User.findOne({
			refreshToken,
		});
		if (!user)
			return res.status(400).json({ message: "Invalid refresh token" });

		// Remove refresh token from database
		user.refreshToken = "";
		await user.save();

		res.status(200).json({ message: "Logout successful" });
	} catch (err) {
		res.status(400).json({
			message: "Error logging out",
			error: err.message,
		});
	}
};

// Refresh token
exports.refreshToken = async (req, res) => {
	const { refreshToken } = req.body;

	try {
		if (!refreshToken)
			return res
				.status(401)
				.json({ message: "No refresh token provided" });

		const user = await User.findOne({ refreshToken });
		if (!user)
			return res.status(401).json({ message: "Invalid refresh token" });

		// Verify refresh token
		const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

		if (decoded.userId !== user._id)
			return res.status(401).json({ message: "Invalid refresh token" });

		// Create new tokens
		const newAccessToken = createToken(user, "access");
		const newRefreshToken = createToken(user, "refresh");

		// Update refresh token in database
		user.refreshToken = newRefreshToken;
		await user.save();

		res.status(200).json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		});
	} catch (err) {
		res.status(401).json({
			message: "Invalid refresh token",
			error: err.message,
		});
	}
};

exports.verifyToken = (req, res) => {
	const { token } = req.body;
	console.log("Token from outside: ", token);

	try {
		// Verify the token using the JWT secret
		console.log("Token inside: ", token);

		const decoded = jwt.verify(token, JWT_SECRET);

		// If the token is valid, send back the user details
		console.log("Decoded: ", decoded);

		res.status(200).json({
			valid: true,
			user: decoded, // Send back user details to the Quiz Microservice
		});
	} catch (err) {
		res.status(401).json({ valid: false, message: "Invalid token." });
	}
};

exports.getUser = async (req, res) => {
	try {
		username = req.body.username;
		// console.log("Username: ", username);
		const users = await User.find({ username });
		if (!users) {
			return res.status(404).json({ message: "User not found" });
		}
		// console.log("Users: ", users);

		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({
			message: "Error fetching users",
			error: err.message,
		});
	}
};
