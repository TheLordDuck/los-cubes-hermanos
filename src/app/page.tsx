"use client";

import { useState } from "react";
import Header from "../components/App/Header";
import CubeList from "../components/CubeList";

const Home = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearchInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setSearchQuery(event.target.value);
	};

	return (
		<>
			<Header
				searchQuery={searchQuery}
				handleSearchInputChange={handleSearchInputChange}
			/>
			<CubeList searchQuery={searchQuery} />
		</>
	);
};

export default Home;
