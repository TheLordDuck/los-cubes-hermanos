"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@mui/material";

interface HeaderProps {
  searchQuery: string;
  handleSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cubeType: string;
  handleCubeTypeChange: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  handleSearchInputChange,
  cubeType,
  handleCubeTypeChange,
}) => {
  return (
    <header className="bg-bluemarine shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/favicon.png" alt="Logo" width={80} height={80} />
        </div>
        <div className="hidden md:flex flex-grow items-center justify-center md:justify-start space-x-6 ml-6">
          <Button
            name="Cube"
            onClick={handleCubeTypeChange}
            variant={cubeType === "Cube" ? "contained" : "outlined"}
            className={`${
              cubeType === "Cube"
                ? "bg-gray-500 text-white"
                : "bg-transparent text-gray-500 border border-gray-500"
            } hover:bg-gray-400 hover:text-white transition-all duration-300`}
          >
            Cube
          </Button>
          <Button
            name="BattleBox"
            onClick={handleCubeTypeChange}
            variant={cubeType === "BattleBox" ? "contained" : "outlined"}
            className={`${
              cubeType === "BattleBox"
                ? "bg-gray-500 text-white"
                : "bg-transparent text-gray-500 border border-gray-500"
            } hover:bg-gray-400 hover:text-white transition-all duration-300`}
          >
            BattleBox
          </Button>
        </div>
        <div className="relative w-4/5 md:w-1/2 ml-4">
          <input
            type="text"
            placeholder="Search cubes..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="border border-gray-300 rounded px-4 py-2 text-black w-full" // Set width to full
          />
        </div>
      </div>
    </header>
  );
};
