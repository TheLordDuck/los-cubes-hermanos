"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Rating from "@mui/material/Rating";
import cubesList from "@/data/cubes.json";

import {
	Card,
	CardContent,
	CardActions,
	Button,
	CardActionArea,
	CardMedia,
	Typography,
} from "@mui/material";

interface CubeItemProps {
	id: string;
}

const CubeItem: React.FC<CubeItemProps> = ({
	id
}) => {
	const router = useRouter();

	const getCube = (id: string) => {
		const cube = cubesList.find(item => item.id === id);

		return cube
	};

	const createQueryString = () => {
		const params = new URLSearchParams();
		params.set("id", id);

		return params.toString();
	};

	const handleClick = () => {
		// Navigate to another page with the card's information
		router.push(`/cube?${createQueryString()}`);
	};

	const cube = getCube(id);

	return (
		<div>
			<Card sx={{ maxWidth: 345 }}>
				<CardActionArea onClick={handleClick}>
					<CardMedia component="img" src={cube?.image ? cube.image : 'default-image.jpg'} alt={cube?.name} height={32} />
					<CardContent sx={{ minHeight: 86 }}>
						<Typography gutterBottom component="div">
							{cube?.name}
						</Typography>
					</CardContent>
				</CardActionArea>
				<CardActions>
					<Rating
						name="read-only"
						precision={0.5}
						value={cube?.difficulty}
						readOnly
					/>
				</CardActions>
				<CardActions>
					<Button href={`https://cubecobra.com/cube/overview/${id}`} size="small" color="primary">
						CubeCobra Link
					</Button>
				</CardActions>
			</Card>
		</div>
	);
};

export default CubeItem;
