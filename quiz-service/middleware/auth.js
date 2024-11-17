import axios from "axios";

// Middleware to verify token by contacting the Auth Microservice
const verifyToken = async (req, res, next) => {
	const token = req.headers["authorization"];

	if (!token) {
		return res.status(403).json({ message: "No token provided." });
	}

	try {
		// Contact the Auth Microservice to verify the token
		console.log("Token: ", token);

		const response = await axios.post(
			"http://auth_microservice:5001/api/auth/verify",
			{
				token: token.replace("Bearer ", ""), // Remove 'Bearer' prefix
			}
		);

		// If the token is valid, proceed to the next middleware/controller
		if (response.data.valid) {
			req.user = response.data.user; // Attach the user info to the request
			next();
		} else {
			res.status(401).json({ message: "Invalid token." });
		}
	} catch (error) {
		res.status(500).json({
			message: "Failed to authenticate token.",
			error: error.message,
		});
	}
};

export { verifyToken };
