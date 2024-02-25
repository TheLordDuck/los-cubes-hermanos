"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
	CardContent,
	Typography,
	AccordionSummary,
	AccordionDetails,
	Accordion,
} from "@mui/material";
import Modal from "../Modal";
import { mechanicText } from "@/utils/mechanics";
import ExpandMoreIcon from "../ExpandMoreIcon";

const CardDetail_Cube = () => {
	const params = useSearchParams();

	const type = params.get("type");
	const id = params.get("id");
	const mechanics = params.get("mechanics");
	const booster_packs = params.get("booster_packs");
	const archetypes = params.get("archetypes");

	const parsedArchetypes = archetypes ? JSON.parse(archetypes) : null;
	const parsedMechanics = mechanics ? JSON.parse(mechanics) : null;
	const parsedBoosterPacks = booster_packs ? JSON.parse(booster_packs) : null;
	const [openModal, setOpenModal] = useState(false);
	const [selectedMechanic, setSelectedMechanic] = useState<string>("");

	const openModalForMechanic = (mechanic: string) => {
		setSelectedMechanic(mechanic);
		setOpenModal(true);
	};

	const closeModal = () => {
		setOpenModal(false);
	};

	return (
		<CardContent>
			<Typography gutterBottom variant="h6" component="div">
				Type: {type}
			</Typography>
			<div>
				<Accordion
					className={openModal ? "pointer-events-none opacity-40" : ""}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel1-content"
						id="panel1-header"
						className="bg-gray-200 py-2"
					>
						<h2 className="text-lg font-semibold">Mechanics</h2>
					</AccordionSummary>
					<AccordionDetails className="flex flex-col mt-2">
						<div className="container py-2">
							<div className="bg-gray-100 p-6 rounded-lg shadow-md">
								{parsedMechanics.length === 0 && (
									<p className="text-sm font-semibold ">No mechanics</p>
								)}
								{parsedMechanics.map((mechanic: string, index: number) => (
									<a
										onClick={() => openModalForMechanic(mechanic)}
										key={index}
										className="mb-2 text-blue-900 text-sm font-semibold flex items-center"
									>
										<div>{mechanic.split("_").join(" ")}</div>
									</a>
								))}
							</div>
						</div>
					</AccordionDetails>
				</Accordion>
				<Modal
					isOpen={openModal}
					onClose={closeModal}
					content={mechanicText[selectedMechanic]}
				/>
				<Accordion
					className={openModal ? "pointer-events-none opacity-15" : ""}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel1-content"
						id="panel1-header"
						className="bg-gray-200 py-2"
					>
						<h2 className="text-lg font-semibold">Archetypes</h2>
					</AccordionSummary>
					<AccordionDetails>
						<div className="container py-2">
							<div className="bg-gray-100 p-1 rounded-lg shadow-md">
								<CardContent>
									{parsedArchetypes.length === 0 && (
										<p className="text-sm font-semibold ">No archetypes</p>
									)}
									{archetypes &&
										parsedArchetypes.map(
											(
												archetype: { colorPair: string; strategy: string },
												index: number
											) => (
												<div
													key={index}
													className="border-b border-gray-300 pt-2"
												>
													<div className="flex items-center">
														{/* Splitting colorPair into individual characters and mapping over them */}
														{archetype.colorPair
															.split("")
															.map((letter, letterIndex) => (
																<div
																	key={letterIndex}
																	className="w-10 h-10 flex-shrink-0"
																>
																	<Image
																		src={`/colors/${letter}.png`}
																		alt={`${letter} image`}
																		width={30} // Fixed width
																		height={30} // Fixed height
																	/>
																</div>
															))}
														<p className="text-sm font-semibold">
															{archetype.strategy}
														</p>
													</div>
												</div>
											)
										)}
								</CardContent>
							</div>
						</div>
					</AccordionDetails>
				</Accordion>
				<Accordion
					className={openModal ? "pointer-events-none opacity-15" : ""}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel1-content"
						id="panel1-header"
						className="bg-gray-200 py-2"
					>
						<h2 className="text-lg font-semibold">Booster Setup</h2>
					</AccordionSummary>
					<AccordionDetails>
						<div className="container py-2">
							{parsedBoosterPacks.map((pack: any, index: number) => (
								<div key={index} className="mb-4">
									{Object.keys(pack).map((packSize, i) => {
										const { players, packs } = pack[packSize];
										return (
											<div key={i} className="mb-4">
												<Typography variant="h6" className="mb-2">
													{`${packSize} Packs (For ${players} Players):`}
												</Typography>
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
													{Object.keys(packs).map((packNumber, j) => {
														const {
															common,
															uncommon,
															rare,
															mythic,
															random,
															timeshifted,
															rare_mythic,
															white,
															blue,
															black,
															red,
															green,
															artifact,
															dedicatedmythic,
															multicolor
														} = packs[packNumber];
														const packContents = [
															{ type: "Common", count: common },
															{ type: "Uncommon", count: uncommon },
															{ type: "Rare", count: rare },
															{ type: "Mythic", count: mythic },
															{ type: "Random", count: random },
															{ type: "Timeshifted", count: timeshifted },
															{ type: "White", count: white },
															{ type: "Blue", count: blue },
															{ type: "Black", count: black },
															{ type: "Red", count: red },
															{ type: "Green", count: green },
															{ type: "Artifact", count: artifact },
															{ type: "DedicatedMythic", count: dedicatedmythic },
															{ type: "Multicolor", count: multicolor },
															{
																type: "Rare_Mythic",
																count: rare_mythic,
															},
														];
														return (
															<div
																key={j}
																className="p-4 bg-gray-100 rounded-lg shadow-md"
															>
																<Typography
																	variant="subtitle1"
																	className="mb-2"
																>
																	Pack {packNumber}
																</Typography>
																<div className="flex justify-center">
																	{packContents.map(
																		({ type, count }, index) =>
																			count && (
																				<div
																					key={index}
																					className="flex flex-col items-center mr-4"
																				>
																					<Image
																						src={`/wildcards/${type.toLocaleLowerCase()}.png`}
																						alt={type}
																						height={32}
																						width={32}
																					/>
																					<Typography variant="body2">
																						{count}
																					</Typography>
																				</div>
																			)
																	)}
																</div>
															</div>
														);
													})}
												</div>
											</div>
										);
									})}
								</div>
							))}
						</div>
					</AccordionDetails>
				</Accordion>
				<Accordion
					className={openModal ? "pointer-events-none opacity-15" : ""}
				>
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

export default CardDetail_Cube;
