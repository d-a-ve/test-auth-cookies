import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import Link from "next/link";
import {
	AnchorHTMLAttributes,
	ComponentProps,
	DetailedHTMLProps,
	ReactNode,
} from "react";
import { buttonVariants } from "./button";

interface LinkButtonVariants
	extends DetailedHTMLProps<
			AnchorHTMLAttributes<HTMLAnchorElement>,
			HTMLAnchorElement
		>,
		VariantProps<typeof buttonVariants> {}

export interface LinkButtonProps extends LinkButtonVariants {
	className?: ComponentProps<"div">["className"];
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	href: string;
}

export function LinkButton({
	leftIcon,
	rightIcon,
	className,
	href,
	children,
	...props
}: LinkButtonProps) {
	const classNames = cn(buttonVariants(props), className);

	return (
		<Link href={href} className={classNames}>
			{leftIcon && leftIcon}
			{children}
			{rightIcon && rightIcon}
		</Link>
	);
}
