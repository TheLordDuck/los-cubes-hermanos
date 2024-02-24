import "@/app/globals.css";
import Header from "@/components/CubeItemDetail/Header";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<section>
			<Header />
			{children}
		</section>
	);
}
