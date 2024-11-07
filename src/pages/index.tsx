import { Button } from "@/components/button";
import { LinkButton } from "@/components/link-button";
import { callApi } from "@/services/base.service";
import { User } from "@/types";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const router = useRouter();
	// do not do this ever
	// Just a quick hack to show that the user logged in from the login page
	const hasSignedIn = router.query["from"] === "login";

	const fetchCurrentUser = async () => {
		setIsLoading(true);
		setErrorMsg(null);
		setUser(null);

		const { status, data, error } = await callApi<User>("/auth/me", "GET");
		if (status === "error") {
			setErrorMsg(error);
			setIsLoading(false);
			return;
		}

		setUser(data);
		setIsLoading(false);
	};

	useEffect(() => {
		fetchCurrentUser();
	}, []);

	return (
		<div className="space-y-3 py-4">
			<h1 className="text-xl font-medium text-center">
				This is a simple project to test authentication with JWTs stored in
				cookies
			</h1>
			<p>
				Not all backend developers know how to store cookies from the server so
				some of them default to sending the tokens to the frontend and leave it
				up to the frontend dev to store it and send it with every request.
			</p>
			<p>
				The backend sends the tokens as part of the login response and it is
				stored as cookies using an API route, so any requests that is then being
				made to the server will be intercepted and the tokens will be added to
				the request before it continues.
			</p>
			<p>
				This way the frontend does not technically need to be sending the tokens
				everytime and just uses the endpoints as it is and the tokens are added.
				I know this can be debated upon and{" "}
				<span className="font-medium">yes, you are correct.</span>
			</p>
			<div className="flex flex-col gap-3">
				<p>So please try it out and let me know what you think.</p>
				<LinkButton href="/login">Login</LinkButton>
			</div>

			<Button
				variant={"secondary"}
				onClick={fetchCurrentUser}
				className="mt-4"
				isLoading={isLoading}>
				Refetch user details
			</Button>
			{errorMsg && (
				<div className="bg-red-200 text-red-500 rounded-md py-1.5 text-sm px-3 flex justify-between items-start gap-4">
					<p>{hasSignedIn ? errorMsg : "Please login to see user details"}</p>
					<button
						className="p-0.5 rounded-sm hover:bg-red-300 duration-100"
						onClick={() => {
							setErrorMsg(null);
						}}>
						<X size={16} />
					</button>
				</div>
			)}
			{user && (
				<div className="bg-white rounded-md p-4 shadow-md">
					<h2 className="text-lg font-bold">User Details</h2>
					<p className="text-sm">Name: {user.firstName}</p>
					<p className="text-sm">Email: {user.email}</p>
					<p className="text-sm">Username: {user.username}</p>
					<p className="text-sm">Age: {user.age}</p>
				</div>
			)}
		</div>
	);
}
