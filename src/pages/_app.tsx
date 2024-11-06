import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
	return (
		<main
			className={cn("w-[min(100%_-_32px,_768px)] min-h-dvh mx-auto", inter.className)}>
			<Component {...pageProps} />
		</main>
	);
}
