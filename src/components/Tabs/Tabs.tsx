import { mechanicText } from "@/utils/mechanics";
import React, { useState } from "react";
import { CardContent } from "@mui/material";
import Image from "next/image";
import { CubeType } from "@/utils/cubeTypes";
import { IconMechanics } from "../Icons/IconMechanics";
import { IconArchetypes } from "../Icons/IconArchetypes";
import { IconBoosterSetup } from "../Icons/IconBoosterSetup";
import { IconOverview } from "../Icons/IconOverview";
import Modal from "../Modal/Modal";
import CubeContent from "@/components/CubeContent/CubeContent";
import { generatePackContents } from "@/utils/packContents";
import DraftTable from "../DraftTable/DraftTable";

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
  type: string;
  rarities: string[];
  text: string; // Mapping of pack numbers to BoosterPackConfig
}

export interface CubeItem {
  id: string;
  name: string;
  image: string;
  difficulty: number;
  type: string;
  mechanics?: string[]; // Mechanics is an array of strings (even if it's empty)
  booster_packs?: BoosterSetup; // Booster pack details mapped by player count
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
  const [activeTab, setActiveTab] = useState<string>("overview");

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

  console.log("parsedBoosterPacks", parsedBoosterPacks);

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

  // Loading for overviwe iframe
  const [loading, setLoading] = useState(true);

  return (
    <Tabs>
      <TabsList>
        <TabsTrigger
          value="overview"
          active={activeTab === "overview"}
          onClick={() => handleTabChange("overview")}
        >
          <span className="hidden md:inline ">Overview</span>
          <span className="md:hidden">
            <IconOverview />
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
      </TabsList>
      <div className="bg-white rounded-lg shadow-md">
        <Modal
          isOpen={openModalBoolean}
          onClose={closeModal}
          content={selectedModalText}
        />
        <TabsContent value="mechanics" active={activeTab === "mechanics"}>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            <div className="container">
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
            <div className="container">
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
                                      alt={`${letter}`}
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
            <div className="container">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                {/* Wildcards */}
                <div className="mt-6">
                  <h2 className="text-lg font-bold mb-2">Wildcards</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {parsedBoosterPacks?.rarities.map((type) => (
                      <div
                        key={type}
                        className="flex flex-col items-center space-y-1"
                      >
                        <Image
                          src={`/wildcards/${type.toLowerCase()}.jpg`}
                          alt={type}
                          height={64}
                          width={64}
                          className="rounded shadow-sm"
                        />
                        <span className="text-xs text-gray-700 capitalize">
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>

                  {parsedBoosterPacks?.type === "normal" ? (
                    <main className="rounded-md">
                      <div className="mt-6">
                        <h2 className="text-lg font-bold mb-2">
                          {" "}
                          Booster Setup
                        </h2>
                      </div>
                      <DraftTable />
                    </main>
                  ) : (
                    <>
                      <div className="mt-6">
                        <h2 className="text-lg font-bold mb-2">
                          Booster Setup
                        </h2>
                        <h1 className="text-sm mb-2">
                          See overview for custom booster packs.
                        </h1>
                        <h1 className="text-sm mb-2">
                          Additional notes: {parsedBoosterPacks?.text}
                        </h1>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </h3>
        </TabsContent>
        <TabsContent value="overview" active={activeTab === "overview"}>
          <div className="relative w-full h-[500px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
              </div>
            )}
            <iframe
              src={`https://cubecobra.com/cube/overview/${cubeItem.id}`}
              title="CubeCobra Overview"
              width="100%"
              height="500"
              className={`w-full h-full border-none ${loading ? "invisible" : "visible"}`}
              onLoad={() => setLoading(false)}
            />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default YourComponent;
