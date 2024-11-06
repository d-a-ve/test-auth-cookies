import axios, { AxiosError, isAxiosError, Method } from "axios";

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

mainApiClient.interceptors.response.use(
	async (response) => {
		if (response.config.url === "/auth/login") {
			const { accessToken, refreshToken } = response.data;
			try {
				await fetch("/api/cookies", {
					method: "POST",
					body: JSON.stringify({
						cookieNames: ["accessToken", "refreshToken"],
						cookieValues: [accessToken, refreshToken],
					}),
				});
			} catch (e: any) {
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
					const res = await fetch("/api/cookies?cookieName=refreshToken");
					const data = await res.json();
					const { refreshToken } = data;

					const refreshAccessTokenRes = await apiClientWithoutInterceptors.request<{
						refreshToken: string;
						accessToken: string;
					}>({
						url: "/auth/refresh",
						method: "POST",
						data: {
							refreshToken,
							expiresInMins: 2
						},
					});
					const failedRequest = error.config;

					failedRequest.headers[
						"Authorization"
					] = `Bearer ${refreshAccessTokenRes.data.accessToken}`;

					failedRequest.headers[
						"x-retry"
					] = true;

					await fetch("/api/cookies", {
						method: "POST",
						body: JSON.stringify({
							cookieNames: ["accessToken", "refreshToken"],
							cookieValues: [
								refreshAccessTokenRes.data.accessToken,
								refreshAccessTokenRes.data.refreshToken,
							],
						}),
					});

					return apiClientWithoutInterceptors(failedRequest);
				} catch (e: any) {
					console.log(e);
				}
			}
		}

		return Promise.reject(error);
	}
);

mainApiClient.interceptors.request.use(
	async (request) => {
		if (request.url === "/auth/me") {
			try {
				const res = await fetch("/api/cookies?cookieName=accessToken");
				const data = await res.json();
				const { accessToken } = data;
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
			console.log(e);
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
