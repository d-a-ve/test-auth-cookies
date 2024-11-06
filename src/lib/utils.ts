import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateRandomIdWithinRange(range = 200) {
	return Math.round(Math.random() * range);
}

export function addMillisecondsToDate(milliseconds: number): Date {
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + milliseconds);
  return futureDate;
}


