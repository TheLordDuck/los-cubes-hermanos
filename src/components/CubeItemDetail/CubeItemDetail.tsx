"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@mui/material";
import CubeItemDetail_CardBody_Cube from "@/components/CubeItemDetail/CubeItemDetail_CardBody_Cube";
import CubeItemDetail_CardBody_BattleBox from "@/components/CubeItemDetail/CubeItemDetail_CardBody_BattleBox";
import { CubeType } from "@/utils/cubeTypes";
import CubeItemDetail_CardHeader from "./CubeItemDetail_CardHeader";
import cubesList from "@/data/cubes.json";

const CardDetail = () => {
	const params = useSearchParams();

	const getCube = (id: string) => {
		const cube = cubesList.find(item => item.id === id);

		return cube
	};

	const id = params.get("id");
	const cube = getCube(id as string)

	return (
		<div className="bg-black p-1 shadow-md rounded-md flex flex-col justify-center items-center h-full">
			<Card sx={{ maxWidth: 2000 }} className="m-2 align-middle">
				<CubeItemDetail_CardHeader />
				{cube?.type === CubeType.Cube ? (
					<CubeItemDetail_CardBody_Cube />
				) : (
					<CubeItemDetail_CardBody_BattleBox />
				)}
			</Card>
		</div>
	);
};

export default CardDetail;
