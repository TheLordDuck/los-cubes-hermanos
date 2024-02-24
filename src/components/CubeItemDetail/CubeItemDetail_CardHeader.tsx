"use client";

import { useSearchParams } from "next/navigation";
import {
	CardContent,
	CardMedia,
	Button,
	Rating,
	Typography,
} from "@mui/material";

const CardDetail_Intro = () => {
	const params = useSearchParams();

	const id = params.get("id");
	const name = params.get("name");
	const difficulty = params.get("difficulty");
	const image = params.get("image");

	return (
		<div className="flex flex-row align-middle">
			<CardMedia
				sx={{ maxWidth: 150, maxHeight: 300 }}
				className="content-center	"
				component="img"
				height="140"
				image={image || ""}
				alt="green iguana"
			/>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					{name}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					<Rating
						name="read-only"
						precision={0.5}
						value={Number(difficulty)}
						readOnly
					/>
				</Typography>
				<Typography variant="body2" color="text.secondary">
					<Button href={`https://cubecobra.com/cube/overview/${id}`}  size="small" color="primary">
						CubeCobra Link
					</Button>
				</Typography>
			</CardContent>
		</div>
	);
};

export default CardDetail_Intro;
