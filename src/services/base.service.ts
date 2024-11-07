import axios, { AxiosError, isAxiosError, Method } from "axios";
import { addTokensToCookies, getTokenFromCookies } from "./cookies.service";

const mainApiClient = axios.create({
	timeout: 30000,
	baseURL: "https://dummyjson.com",
	headers: {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
	},
});

const apiClientWithoutInterceptors = axios.create({
	timeout: 30000,
	baseURL: "https://dummyjson.com",
	headers: {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
	},
});

const getNewAccessToken = async (refreshToken: string) => {
	return await apiClientWithoutInterceptors.request<{
		refreshToken: string;
		accessToken: string;
	}>({
		url: "/auth/refresh",
		method: "POST",
		data: {
			refreshToken,
			expiresInMins: 2,
		},
	});
};


mainApiClient.interceptors.request.use(
	async (request) => {
		if (request.url === "/auth/me") {
			try {
				let { accessToken, refreshToken } = await getTokenFromCookies(
					"accessToken,refreshToken"
				);

				// BOTH ACCESS AND REFRESH TOKENS HAS BEEN DELETED OR DO NOT EXISTS IN THE COOKIES, SO THROW AN ERROR SINCE THIS IS A PROTECTED ENDPOINT, NO NEED TO WASTE RESOURCES AND TIME.
				if (!accessToken && !refreshToken) {
					// A better error message can be thrown to the user depending on context
					throw new AxiosError(
						"Your session has expired. Please log in again.",
						"401"
					);
				}

				// ACCESS TOKEN HAS BEEN DELETED BUT REFRESH TOKEN STILL EXISTS IN THE COOKIES, SO GET NEW ACCESS TOKEN AND CONTINUE WITH THE REQUEST.
				if (!accessToken && refreshToken) {
					const newTokens = await getNewAccessToken(refreshToken);
					accessToken = newTokens.data.accessToken;
					refreshToken = newTokens.data.refreshToken;

					await addTokensToCookies(accessToken, refreshToken);
				}

				request.headers = request.headers || {};

				request.headers["Authorization"] = `Bearer ${accessToken}`;

				return request;
			} catch (error) {
				return Promise.reject(error);
			}
		}

		return request;
	},
	(error: AxiosError<{ message: string }>) => {
		return Promise.reject(error);
	}
);

mainApiClient.interceptors.response.use(
	async (response) => {
		if (response.config.url === "/auth/login") {
			const { accessToken, refreshToken } = response.data;
			try {
				await addTokensToCookies(accessToken, refreshToken);
			} catch (e: any) {
				// handle error properly, what I can think of is mainly reporting to error tracker like sentry
				console.log(e);
			}
		}
		return response;
	},
	async (error: AxiosError<{ message: string }>) => {
		if (error.config) {
			const retried = error.config.headers["x-retry"];
			if (error.status === 401 && !retried) {
				try {
					const { refreshToken } = await getTokenFromCookies("refreshToken");

					// NO REFRESH TOKEN EXISTS IN COOKIES, EITHER IT WAS DELETED OR NOT SET PROPERLY.
					// THROW ERROR, SINCE WE CANNOT GET NEW ACCESS TOKEN WHEN REFRESH TOKEN DOES NOT EXISTS.
					if (!refreshToken) {
						throw new AxiosError(
							"Your session has expired. Please log in again.",
							"401"
						);
					}

					const refreshAccessTokenRes = await getNewAccessToken(refreshToken);

					const failedRequest = error.config;

					failedRequest.headers[
						"Authorization"
					] = `Bearer ${refreshAccessTokenRes.data.accessToken}`;

					failedRequest.headers["x-retry"] = true;

					await addTokensToCookies(
						refreshAccessTokenRes.data.accessToken,
						refreshAccessTokenRes.data.refreshToken
					);

					return apiClientWithoutInterceptors(failedRequest);
				} catch (e: any) {
					// ONE MIGHT WANT TO SEND A GENERIC ERROR TO THE USER IF ANY FAILS
					return Promise.reject(e);
				}
			}
		}

		return Promise.reject(error);
	}
);

type SuccessResponse<TData> = {
	status: "success";
	data: TData;
	error: undefined;
};

type ErrorResponse = {
	status: "error";
	error: string;
	data: undefined;
};

export const callApi = async <TRes>(
	url: string,
	method: Method,
	data?: Record<string, unknown>,
	params?: Record<string, unknown>
): Promise<SuccessResponse<TRes> | ErrorResponse> => {
	try {
		const res = await mainApiClient.request<TRes>({
			url,
			method,
			data,
			params,
		});

		return {
			status: "success",
			data: res.data,
			error: undefined,
		};
	} catch (e: unknown) {
		if (isAxiosError(e)) {
			return {
				status: "error",
				error: e.response ? e.response.data.message : e.message,
				data: undefined,
			};
		}

		return {
			status: "error",
			error: "An unexpected error occurred. Please try again later.",
			data: undefined,
		};
	}
};
