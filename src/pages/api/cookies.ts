import { addMillisecondsToDate } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

const cookiesApi = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "POST") {
		const parsedBody = req.body;
		const { cookieNames, cookieValues } = parsedBody;

		if (Array.isArray(cookieNames) && Array.isArray(cookieValues)) {
			const allCookies = cookieNames.map(
				(name, index) =>
					`${name}=${cookieValues[index]}; httpOnly=true; secure: ${
						process.env.NODE_ENV === "production"
					}; sameSite: none; path: /; maxAge=${
						60 * 2
					}; expires: ${addMillisecondsToDate(
						1000 * 60 * 2
					)}; partitioned: true;`
			);
			res.setHeader("Set-Cookie", allCookies);
			return res.status(201).json({ message: "Cookies set successfully" });
		}
		return res.status(400).json({ message: "Invalid request body" });
	}

	if (req.method === "GET") {
		const cookieNames = req.query.cookieName;
		if (cookieNames && !Array.isArray(cookieNames)) {
			const cookies = cookieNames
				.split(",")
				.reduce((acc: { [k: string]: string }, curr) => {
					acc[curr] = req.cookies[curr] as string;

					return acc;
				}, {});

			// if the values in the cookies are undefined
			if (Object.values(cookies).every((cookie) => !cookie)) {
				return res.status(400).json({ message: "Session not found. Please log in again." });
			}

			return res.status(200).json(cookies);
		}
		return res.status(400).json({ message: "Session not found. Please log in again." });
	}

	return res.status(405).json({ message: "Method not allowed" });
};

export default cookiesApi;
