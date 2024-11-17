// write a function to call and api with username

import axios from "axios";

const getUser = async (username) => {
	try {
		const response = await axios.post(
			"http://auth_microservice:5001/api/auth/getUser",
			{
				username: username,
			}
		);
		if (response.status !== 200) {
			return null;
		}
		// console.log("Response: ", response);
		return response.data;
	} catch (error) {
		return null;
	}
};

export { getUser };
