import React from "react";

import cubesList from "@/data/cubes.json";
import CubeItem from "./CubeItem";

interface CubeListProps {
	searchQuery: string;
}

const CubeList: React.FC<CubeListProps> = ({ searchQuery }) => {
	const filteredCubes = cubesList.filter((cubeItem) =>
		cubeItem.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<section className="container mx-auto m-2">
			<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
				{filteredCubes.map((cubeItem, index) => (
					<CubeItem
						id={cubeItem.id}
						key={index}
						name={cubeItem.name}
						image={cubeItem.image}
						difficulty={cubeItem.difficulty}
						type={cubeItem.type}
						booster_packs={cubeItem.booster_packs}
						mechanics={cubeItem.mechanics}
						archetypes={cubeItem.archetypes}
					/>
				))}
			</div>
		</section>
	);
};

export default CubeList;
