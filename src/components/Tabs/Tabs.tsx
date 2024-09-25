import { mechanicText } from "@/utils/mechanics";
import React, { useState } from "react";
import MechanicsModal from "../MechanicsModal/MechanicsModal";
import { CardContent, Typography } from "@mui/material";
import Image from "next/image";

// Placeholder icon components
const IconMechanics = () => <span>⚙️</span>; // Replace with your icon
const IconArchetypes = () => <span>🧙‍♂️</span>; // Replace with your icon
const IconBoosterSetup = () => <span>📦</span>; // Replace with your icon
const IconRulesAndNotes = () => <span>📜</span>; // Replace with your icon

interface Archetype {
  colorPair: string;
  strategy: string;
}

interface BoosterPackConfig {
  random?: number;
  common?: number;
  uncommon?: number;
  rare_mythic?: number;
}

interface BoosterSetup {
  players: string; // "5-8" or "2-4" based on the JSON data
  packs: Record<string, BoosterPackConfig>; // Mapping of pack numbers to BoosterPackConfig
}

export interface CubeItem {
  id: string;
  name: string;
  image: string;
  difficulty: number;
  type: string;
  mechanics?: string[]; // Mechanics is an array of strings (even if it's empty)
  booster_packs?: Record<string, BoosterSetup[]>; // Booster pack details mapped by player count
  archetypes?: Archetype[]; // Archetypes array with color pair and strategy
}

interface TabsProps {
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
  return <div className="tabs">{children}</div>;
};

const TabsList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="tabs-list flex border-b">{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  active,
  onClick,
  children,
}) => {
  return (
    <button
      className={`tab-trigger flex-1 py-2 text-center ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"} hover:bg-blue-500 transition-colors`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  active: boolean;
  children: React.ReactNode;
}

const TabsContent: React.FC<TabsContentProps> = ({
  value,
  active,
  children,
}) => {
  return active ? <div className="tabs-content">{children}</div> : null;
};

interface YourComponentProps {
  cubeItem: CubeItem;
}

const YourComponent: React.FC<YourComponentProps> = ({ cubeItem }) => {
  const [activeTab, setActiveTab] = useState<string>("mechanics");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const parseIfString = <T,>(data: string | T): T => {
    if (typeof data === "string") {
      return JSON.parse(data) as T;
    }
    return data as T;
  };

  const parsedArchetypes = cubeItem?.archetypes
    ? parseIfString(cubeItem.archetypes)
    : null;
  const parsedMechanics = cubeItem?.mechanics
    ? parseIfString(cubeItem.mechanics)
    : null;
  const parsedBoosterPacks = cubeItem?.booster_packs
    ? parseIfString(cubeItem.booster_packs)
    : null;

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
    <Tabs>
      <TabsList>
        <TabsTrigger
          value="mechanics"
          active={activeTab === "mechanics"}
          onClick={() => handleTabChange("mechanics")}
        >
          <span className="hidden md:inline">Mechanics</span>
          <span className="md:hidden">
            <IconMechanics />
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="archetypes"
          active={activeTab === "archetypes"}
          onClick={() => handleTabChange("archetypes")}
        >
          <span className="hidden md:inline">Archetypes</span>
          <span className="md:hidden">
            <IconArchetypes />
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="boosterSetup"
          active={activeTab === "boosterSetup"}
          onClick={() => handleTabChange("boosterSetup")}
        >
          <span className="hidden md:inline">Booster Setup</span>
          <span className="md:hidden">
            <IconBoosterSetup />
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="rulesAndNotes"
          active={activeTab === "rulesAndNotes"}
          onClick={() => handleTabChange("rulesAndNotes")}
        >
          <span className="hidden md:inline">Rules and Notes</span>
          <span className="md:hidden">
            <IconRulesAndNotes />
          </span>
        </TabsTrigger>
      </TabsList>
      <div className="bg-white rounded-lg shadow-md p-6">
        <MechanicsModal
          isOpen={openModal}
          onClose={closeModal}
          content={mechanicText[selectedMechanic]}
        />
        <TabsContent value="mechanics" active={activeTab === "mechanics"}>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Mechanics
            <div className="container py-2">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                {parsedMechanics?.length === 0 && (
                  <p className="text-sm font-semibold ">No mechanics</p>
                )}
                {parsedMechanics?.map((mechanic: string, index: number) => (
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
          </h3>
        </TabsContent>
        <TabsContent value="archetypes" active={activeTab === "archetypes"}>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Archetypes
            <div className="container py-2">
              <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <CardContent>
                  {parsedArchetypes?.length === 0 && (
                    <p className="text-sm font-semibold">No archetypes</p>
                  )}
                  {cubeItem?.archetypes &&
                    parsedArchetypes?.map(
                      (
                        archetype: { colorPair: string; strategy: string },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="border-b border-gray-300 py-4 last:border-none"
                          /* Added py-4 to increase space within each row */
                        >
                          {/* Container for images and text */}
                          <div className="flex flex-wrap md:flex-nowrap items-center">
                            {/* Image container: displays colors horizontally */}
                            <div className="flex flex-row items-center gap-2">
                              {archetype.colorPair
                                .split("")
                                .map((letter, letterIndex) => (
                                  <div
                                    key={letterIndex}
                                    className="w-8 h-8 flex-shrink-0"
                                  >
                                    <Image
                                      src={`/colors/${letter}.png`}
                                      alt={`${letter} color`}
                                      width={30}
                                      height={30}
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                            </div>

                            {/* Add clear margin between images and text */}
                            <p className="text-sm font-semibold ml-4 mt-2 md:mt-0">
                              {archetype.strategy}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                </CardContent>
              </div>
            </div>
          </h3>
        </TabsContent>
        <TabsContent value="boosterSetup" active={activeTab === "boosterSetup"}>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Booster Setup
          </h3>
          <p className="text-gray-700">
            <div className="text-gray-700">
              <div className="container py-2">
                {// @ts-ignore
                parsedBoosterPacks?.map((pack: any, index: number) => (
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
                              // Extract pack details
                              const {
                                common = 0,
                                uncommon = 0,
                                rare = 0,
                                mythic = 0,
                                random = 0,
                                timeshifted = 0,
                                rare_mythic = 0,
                                white = 0,
                                blue = 0,
                                black = 0,
                                red = 0,
                                green = 0,
                                artifact = 0,
                                dedicatedmythic = 0,
                                multicolor = 0,
                                land = 0,
                                artifact_land = 0,
                                random_any_color = 0,
                              } = packs[packNumber] || {};

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
                                {
                                  type: "DedicatedMythic",
                                  count: dedicatedmythic,
                                },
                                { type: "Multicolor", count: multicolor },
                                { type: "Land", count: land },
                                { type: "Artifact_Land", count: artifact_land },
                                {
                                  type: "Random_Any_Color",
                                  count: random_any_color,
                                },
                                { type: "Rare_Mythic", count: rare_mythic },
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
                                        count > 0 ? (
                                          <div
                                            key={index}
                                            className="flex flex-col items-center mr-4"
                                          >
                                            <Image
                                              src={`/wildcards/${type.toLowerCase()}.png`}
                                              alt={type}
                                              height={32}
                                              width={32}
                                            />
                                            <Typography variant="body2">
                                              {count}
                                            </Typography>
                                          </div>
                                        ) : null
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
            </div>
          </p>
        </TabsContent>
        <TabsContent
          value="rulesAndNotes"
          active={activeTab === "rulesAndNotes"}
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Rules and Notes
          </h3>
          <div className="container py-2">
            <div className="bg-gray-100 p-0 rounded-lg shadow-md">
              <iframe
                src={`https://cubecobra.com/cube/overview/${cubeItem.id}#card-body`}
                title="Your Embedded Page"
                width="100%"
                height="500"
              />
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default YourComponent;
