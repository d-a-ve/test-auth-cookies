import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
	ButtonHTMLAttributes,
	DetailedHTMLProps,
	LegacyRef,
	forwardRef,
} from "react";

export const buttonVariants = cva(
	"relative flex items-center font-medium border border-solid justify-center gap-5 w-fit rounded-md disabled:opacity-60 disabled:cursor-not-allowed duration-200",
	{
		variants: {
			variant: {
				primary:
					"bg-primary-500 border-primary-500 hover:border-primary-600 hover:bg-primary-600 focus-visible:bg-primary-600 focus-visible:border-primary-600 text-white",
				secondary:
					"bg-primary-100 border-primary-500 hover:bg-primary-300 focus-visible:bg-primary ",
			},
			size: {
				sm: "py-1.5 px-3 text-sm",
				md: "py-2 px-4 text-base",
				lg: "py-3 px-6 text-lg",
				none: "py-0 px-0",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "sm",
		},
	}
);

interface ButtonVariants
	extends DetailedHTMLProps<
			ButtonHTMLAttributes<HTMLButtonElement>,
			HTMLButtonElement
		>,
		VariantProps<typeof buttonVariants> {}

export interface ButtonProps extends ButtonVariants {
	children: React.ReactNode;
	className?: React.ComponentProps<"div">["className"];
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	isLoading?: boolean;
	disabled?: boolean;
	spinnerColor?: string;
	spinnerSize?: string | number;
	contentClassName?: string;
}
export const Button = forwardRef(function Button(
	{
		children,
		isLoading,
		disabled,
		leftIcon,
		rightIcon,
		className,
		spinnerColor,
		spinnerSize,
		contentClassName,
		...props
	}: ButtonProps,
	ref: LegacyRef<HTMLButtonElement>
) {
	const classNames = cn(buttonVariants(props), className);

	return (
		<button
			disabled={(isLoading ?? disabled) || disabled}
			className={classNames}
			ref={ref}
			{...props}>
			<div className="absolute top-0 flex h-full w-full flex-col items-center justify-center">
				<svg
					width={spinnerSize ?? "20"}
					height={spinnerSize ?? "20"}
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					className={cn(
						"animate-spin",
						isLoading ? "opacity-1 visible" : "hidden opacity-0"
					)}>
					<path
						fill={spinnerColor ?? "#fff"}
						d="M12 21a9 9 0 1 1 6.18-15.55a.75.75 0 0 1 0 1.06a.74.74 0 0 1-1.06 0A7.51 7.51 0 1 0 19.5 12a.75.75 0 0 1 1.5 0a9 9 0 0 1-9 9Z"
					/>
				</svg>
			</div>
			<div
				className={cn(
					"flex items-center justify-center gap-4",
					isLoading ? "opacity-0" : "opacity-1",
					contentClassName
				)}>
				{leftIcon}
				{children}
				{rightIcon && (
					<span
						style={{
							opacity: isLoading ? 0 : 1,
						}}>
						{rightIcon}
					</span>
				)}
			</div>
		</button>
	);
});
