"use client";

import { useSearchParams } from "next/navigation";
import {
	CardContent,
	Typography,
	AccordionSummary,
	AccordionDetails,
	Accordion,
} from "@mui/material";
import ExpandMoreIcon from "../ExpandMoreIcon";

const CardDetail_BattleBox = () => {
	const params = useSearchParams();

	const type = params.get("type");
	const id = params.get("id");

	return (
		<CardContent>
			<Typography gutterBottom variant="h6" component="div">
				Type: {type}
			</Typography>
			<div>
				<Accordion>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel1-content"
						id="panel1-header"
						className="bg-gray-200 py-2"
					>
						<h2 className="text-lg font-semibold">Rules and notes</h2>
					</AccordionSummary>
					<AccordionDetails>
						<div className="container py-2">
							<div className="bg-gray-100 p-0 rounded-lg shadow-md">
								<iframe
									src={`https://cubecobra.com/cube/overview/${id}#card-body`}
									title="Your Embedded Page"
									width="100%"
									height="500"
								/>
							</div>
						</div>
					</AccordionDetails>
				</Accordion>
			</div>
		</CardContent>
	);
};

export default CardDetail_BattleBox;
