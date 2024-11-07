import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { generateRandomIdWithinRange } from "@/lib/utils";
import { callApi } from "@/services/base.service";
import { User } from "@/types";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { FormEvent, useRef, useState } from "react";

export default function Login() {
	const [isLoading, setIsLoading] = useState(false);
	const [isDummyUserLoading, setIsDummyUserLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<{
		user: string | null;
		auth: string | null;
	}>({ user: null, auth: null });
	const [dummyUser, setDummyUser] = useState<User | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const router = useRouter();

	const getDummyUser = async () => {
		formRef.current?.reset();

		setIsDummyUserLoading(true);
		setErrorMsg((prev) => ({ ...prev, user: null }));

		const id = generateRandomIdWithinRange();
		const { status, data, error } = await callApi<User>(`/users/${id}`, "GET");

		if (status === "error") {
			setErrorMsg((prev) => ({ ...prev, user: error }));
			setIsDummyUserLoading(false);
			return;
		}

		setDummyUser(data);
		setIsDummyUserLoading(false);
	};

	const submit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsLoading(true);
		setErrorMsg((prev) => ({ ...prev, auth: null }));

		const formData = new FormData(e.currentTarget);
		const data = {
			username: formData.get("username")!.toString(),
			password: formData.get("password")!.toString(),
			expiresInMins: 2,
		};

		const { status, error } = await callApi("/auth/login", "POST", data);

		setIsLoading(false);

		if (status === "error") {
			return setErrorMsg((prev) => ({ ...prev, auth: error }));
		}

		router.push("/?from=login");
	};

	return (
		<div className="min-h-dvh flex flex-col items-center justify-center space-y-8">
			<div className="space-y-4">
				<h1>
					Login to a dummy account. Accounts are gotten from{" "}
					<span className="italic text-primary-500 text-sm">
						https://dummyjson.com
					</span>
				</h1>
				<Button onClick={getDummyUser} isLoading={isDummyUserLoading}>
					Fill in dummy details
				</Button>
				{errorMsg.user && (
					<div className=" bg-red-200 text-red-500 rounded-md py-1.5 text-sm px-3 flex justify-between items-start gap-4">
						<p>{errorMsg.user}</p>
						<button
							className="p-0.5 rounded-sm bg-red-300 hover:bg-red-600 duration-100"
							onClick={() => {
								setErrorMsg((prev) => ({ ...prev, user: null }));
								getDummyUser();
							}}>
							Retry
						</button>
					</div>
				)}
			</div>
			<form
				className="w-[min(100%,_480px)] mx-auto space-y-4"
				onSubmit={submit}
				ref={formRef}>
				<div className="space-y-2">
					<label htmlFor="username">Username</label>
					<Input
						id="username"
						name="username"
						defaultValue={dummyUser?.username}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="password">Password</label>
					<Input
						id="password"
						name="password"
						type="password"
						defaultValue={dummyUser?.password}
					/>
				</div>
				<div className="pt-3">
					<Button className="w-full" isLoading={isLoading}>
						Login
					</Button>
				</div>
				{errorMsg.auth && (
					<div className=" bg-red-200 text-red-500 rounded-md py-1.5 text-sm px-3 flex justify-between items-start gap-4">
						<p>{errorMsg.auth}</p>
						<button
							className="p-0.5 rounded-sm hover:bg-red-300 duration-100"
							onClick={() => setErrorMsg((prev) => ({ ...prev, auth: null }))}>
							<X size={16} className="stroke-red-500" />
							<span className="sr-only">Remove error</span>
						</button>
					</div>
				)}
			</form>
		</div>
	);
}
