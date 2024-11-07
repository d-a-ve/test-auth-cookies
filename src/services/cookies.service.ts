import axios from "axios";

export const addTokensToCookies = async (
	accessToken: string,
	refreshToken: string
) => {
	await axios.request({
		url: "/api/cookies",
		method: "POST",
		data: {
			cookieNames: ["accessToken", "refreshToken"],
			cookieValues: [accessToken, refreshToken],
		},
	});
};

export const getTokenFromCookies = async (
	cookieName: string
): Promise<Record<string, string>> => {
	const res = await axios.request({
		url: "/api/cookies",
		method: "GET",
		params: {
			cookieName,
		},
	});
	return res.data;
};
