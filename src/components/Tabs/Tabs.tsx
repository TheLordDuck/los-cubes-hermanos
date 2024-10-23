import { mechanicText } from "@/utils/mechanics";
import React, { useState } from "react";
import { CardContent } from "@mui/material";
import Image from "next/image";
import { CubeType } from "@/utils/cubeTypes";
import { IconMechanics } from "../Icons/IconMechanics";
import { IconArchetypes } from "../Icons/IconArchetypes";
import { IconBoosterSetup } from "../Icons/IconBoosterSetup";
import { IconRulesAndNotes } from "../Icons/IconRulesAndNotes";
import Modal from "../Modal/Modal";
import CubeContent from "@/components/CubeContent/CubeContent";
import { generatePackContents } from "@/utils/packContents";

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
  return (
    <div className="tabs-list flex border-t border-gray-300 rounded-t-lg overflow-hidden">
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  cubeType?: CubeType;
}
interface TabsTriggerProps {
  value: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean; // Add a disabled prop
  children: React.ReactNode;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  active,
  onClick,
  disabled = false,
  children,
}) => {
  return (
    <button
      className={`flex-1 py-2 px-4 text-center transition-colors duration-200 ${
        active
          ? "bg-active text-white font-semibold"
          : "bg-inactive text-gray-800 hover:bg-gray-200"
      } ${
        disabled
          ? "cursor-not-allowed bg-disabled text-gray-500"
          : "cursor-pointer"
      } ${
        disabled ? "hover:bg-disabled focus:bg-disabled active:bg-disabled" : "" // Prevent focus and active styles when disabled
      }`}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
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

  const [openModalBoolean, setOpenModalBoolean] = useState(false);
  const [selectedModalText, setSelectedModalText] = useState<string>("");

  const openModal = (mechanic: string) => {
    console.log("Open modal for mechanic:", mechanic);
    setSelectedModalText(mechanic);
    setOpenModalBoolean(true);
  };

  const closeModal = () => {
    setOpenModalBoolean(false);
  };

  // State to manage the accordion
  const [openIndices, setOpenIndices] = useState<string[]>([]);

  const toggleAccordion = (index: string) => {
    setOpenIndices((prevIndices) =>
      prevIndices.includes(index)
        ? prevIndices.filter((i) => i !== index)
        : [...prevIndices, index]
    );
  };

  return (
    <Tabs>
      <TabsList>
        <TabsTrigger
          value="mechanics"
          active={activeTab === "mechanics"}
          onClick={() => handleTabChange("mechanics")}
        >
          <span className="hidden md:inline py-10">Mechanics</span>
          <span className="md:hidden">
            <IconMechanics />
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="archetypes"
          active={activeTab === "archetypes"}
          onClick={() => handleTabChange("archetypes")}
          disabled={cubeItem.type === CubeType.BattleBox} // Disable when cube type is "battlebox"
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
          disabled={cubeItem.type === CubeType.BattleBox} // Disable when cube type is "battlebox"
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
          <span className="hidden md:inline ">Rules and Notes</span>
          <span className="md:hidden">
            <IconRulesAndNotes />
          </span>
        </TabsTrigger>
      </TabsList>
      <div className="bg-white rounded-lg shadow-md p-6 py-10">
        <Modal
          isOpen={openModalBoolean}
          onClose={closeModal}
          content={selectedModalText}
        />
        <TabsContent value="mechanics" active={activeTab === "mechanics"}>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Mechanics
            <div className="container py-2">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <CardContent>
                  {parsedMechanics?.length === 0 && (
                    <p className="text-sm font-semibold ">No mechanics</p>
                  )}
                  {parsedMechanics?.map((mechanic: string, index: number) => (
                    <a
                      onClick={() => openModal(mechanicText[mechanic])}
                      key={index}
                      className="mb-2 text-blue-900 text-sm font-semibold flex items-center"
                    >
                      <div>{mechanic.split("_").join(" ")}</div>
                    </a>
                  ))}
                </CardContent>
              </div>
            </div>
          </h3>
        </TabsContent>
        <TabsContent value="archetypes" active={activeTab === "archetypes"}>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Archetypes
            <div className="container py-2">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
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
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Booster Setup
          </h3>

          <div className="space-y-4">
            {// @ts-ignore
            parsedBoosterPacks?.map((pack: any, packIndex: number) => (
              <div key={packIndex}>
                {Object.keys(pack).map((packSize, i) => {
                  const { players, packs } = pack[packSize];

                  // Create a unique key for each section (combine outer and inner loop indices)
                  const uniqueAccordionIndex = `${packIndex}-${i}`;

                  return (
                    <div
                      key={i}
                      className="mb-4 bg-white border border-gray-200 rounded-lg shadow"
                    >
                      {/* Header for the accordion */}
                      <button
                        onClick={() => toggleAccordion(uniqueAccordionIndex)}
                        className="w-full text-left p-4 bg-gray-100 rounded-t-lg focus:outline-none"
                      >
                        <h4 className="text-lg font-semibold text-black">
                          {`${packSize} Packs (For ${players} Players)`}
                        </h4>
                      </button>

                      {/* Accordion content */}
                      {openIndices.includes(uniqueAccordionIndex) && (
                        <div className="p-4">
                          {/* Dynamically set grid columns based on the number of packs */}
                          <div
                            className={`grid grid-cols-1 ${
                              Object.keys(packs).length === 1
                                ? "md:grid-cols-1" // 1 column if there's only 1 pack
                                : Object.keys(packs).length === 2
                                  ? "md:grid-cols-2" // 2 columns for 2 packs
                                  : Object.keys(packs).length === 3
                                    ? "md:grid-cols-3" // 3 columns for 3 packs
                                    : "md:grid-cols-4" // Default to 4 columns for 4 or more packs
                            } gap-6`}
                          >
                            {Object.keys(packs).map((packNumber, j) => {
                              const packContents = generatePackContents(
                                packs,
                                packNumber
                              );

                              return (
                                <div
                                  key={j}
                                  className="p-4 bg-gray-50 rounded-lg shadow-md"
                                >
                                  <h5 className="text-md font-medium mb-4 text-center text-black">
                                    Pack {packNumber}
                                  </h5>
                                  <div className="grid grid-cols-3 gap-2 justify-center items-center">
                                    {packContents.map(
                                      ({ type, count }, index) =>
                                        count > 0 && (
                                          <div
                                            onClick={() =>
                                              openModal(
                                                "Wildcard: " +
                                                  type.split("_").join(" ")
                                              )
                                            }
                                            key={index}
                                            className="flex flex-col items-center"
                                          >
                                            <Image
                                              src={`/wildcards/${type.toLowerCase()}.jpg`}
                                              alt={type}
                                              height={32}
                                              width={32}
                                            />
                                            <p className="text-sm font-semibold mt-2 text-black">
                                              {count}
                                            </p>
                                          </div>
                                        )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent
          value="rulesAndNotes"
          active={activeTab === "rulesAndNotes"}
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Rules and Notes
          </h3>
          <div className="bg-gray-100 p-0 rounded-lg shadow-md">
            <iframe
              src={`https://cubecobra.com/cube/overview/${cubeItem.id}#card-body`}
              title="Your Embedded Page"
              width="100%"
              height="500"
            />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default YourComponent;
