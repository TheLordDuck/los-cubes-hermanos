"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Rating from "@mui/material/Rating";

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
	name: string;
	image: string;
	difficulty: number;
	type: string;
	booster_packs: Object[] | undefined;
	mechanics: Object[] | undefined;
	archetypes: Object[] | undefined;
}

const CubeItem: React.FC<CubeItemProps> = ({
	id,
	name,
	image,
	difficulty,
	type,
	mechanics,
	booster_packs,
	archetypes,
}) => {
	const router = useRouter();

	const createQueryString = () => {
		const params = new URLSearchParams();
		params.set("id", id);
		params.set("name", name);
		params.set("image", image);
		params.set("difficulty", String(difficulty));
		params.set("type", type);
		params.set("booster_packs", JSON.stringify(booster_packs));
		params.set("mechanics", JSON.stringify(mechanics));
		params.set("archetypes", JSON.stringify(archetypes));

		return params.toString();
	};

	const handleClick = () => {
		// Navigate to another page with the card's information
		router.push(`/cube?${createQueryString()}`);
	};

	return (
		<div>
			<Card sx={{ maxWidth: 345 }}>
				<CardActionArea onClick={handleClick}>
					<CardMedia component="img" src={`${image}`} alt={name} height={32} />
					<CardContent sx={{ minHeight: 86 }}>
						<Typography gutterBottom component="div">
							{name}
						</Typography>
					</CardContent>
				</CardActionArea>
				<CardActions>
					<Rating
						name="read-only"
						precision={0.5}
						value={difficulty}
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
