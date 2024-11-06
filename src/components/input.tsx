import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { VariantProps, cva } from "class-variance-authority";
import React, {
	DetailedHTMLProps,
	InputHTMLAttributes,
	LegacyRef,
	forwardRef,
	useState,
} from "react";

export const inputVariants = cva(
	"relative px-3 py-2 flex items-center justify-center gap-3 rounded-md transition-all select-none text-base border-solid border w-full",
	{
		variants: {
			variant: {
				default:
					"border-primary-500 bg-transparent focus-within:bg-primary-50 disabled:[&_input]:text-black/50",
			},
			inputSize: {
				sm: "py-1.5 px-3",
				md: "py-2 px-4",
				lg: "py-3 px-6",
			},
		},
		defaultVariants: {
			variant: "default",
			inputSize: "sm",
		},
	}
);

export interface InputVariants
	extends DetailedHTMLProps<
			InputHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		>,
		VariantProps<typeof inputVariants> {}

interface TextInputProps extends InputVariants {
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isLoading?: boolean;
	disabled?: boolean;
	type?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	placeHolder?: string;
	isPasswordVisible?: boolean;
	inputClassName?: string;
	isSearch?: boolean;
}

export const Input = forwardRef(function Input(
	{
		className,
		leftIcon,
		rightIcon,
		type,
		isLoading,
		disabled,
		onChange,
		placeHolder = '',
		variant,
		inputSize,
		inputClassName,
		isSearch,
		...props
	}: TextInputProps,
	ref: LegacyRef<HTMLInputElement>
) {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const classNames = cn(
		inputVariants({ variant, inputSize }),
		className,
		disabled || isLoading ? "opacity-[.8] cursor-not-allowed" : ""
	);
	const isPassword = type === "password";
	const inputType = isPassword
		? isPasswordVisible
			? "text"
			: "password"
		: type;

	return (
		<div className={classNames}>
			{leftIcon && (
				<span className="inline-flex space-x-3">
					{leftIcon}
					{isSearch && (
						<span className="block w-0.5 bg-clr-gray" aria-hidden="true"></span>
					)}
				</span>
			)}
			<input
				onChange={onChange}
				type={inputType}
				className={cn(
					"placeholder:text-foreground/70 w-full bg-transparent outline-none",
					disabled ?? isLoading ? "cursor-not-allowed" : "",
					inputClassName
				)}
				placeholder={placeHolder}
				disabled={isLoading ?? disabled}
				ref={ref}
				{...props}
			/>
			{isPassword && (
				<button
					type="button"
					className="absolute right-4 top-1/2 -translate-y-1/2"
					onClick={() => setIsPasswordVisible((prev) => !prev)}>
					{isPasswordVisible ? (
						<EyeIcon size={20} className="stroke-clr-primary" />
					) : (
						<EyeOffIcon size={20} className="stroke-clr-primary" />
					)}
				</button>
			)}
			<style jsx>
				{`
					input:-webkit-autofill,
					input:-webkit-autofill:hover,
					input:-webkit-autofill:focus,
					input:-webkit-autofill:active {
						-webkit-background-clip: text;
						-webkit-text-fill-color: #000;
						//this transition actually does nothing, its a fallback for older chrome browswers
						transition: background-color 5000s ease-in-out 0s;
						box-shadow: inset 0 0 20px 20px #fff;
					}
				`}
			</style>
			{rightIcon && rightIcon}
		</div>
	);
});
