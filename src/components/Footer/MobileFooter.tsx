"use client";

import React, { useState } from "react";
import { Button } from "@mui/material";

interface MobileFooterProps {
  cubeType: string;
  handleCubeTypeChange: (event: React.MouseEvent<HTMLButtonElement>) => void; // Define the prop type
}

export const MobileFooter: React.FC<MobileFooterProps> = ({
  cubeType,
  handleCubeTypeChange,
}) => {
  const handleClick = (tab: string) => {
    handleCubeTypeChange({
      currentTarget: { name: tab },
    } as React.MouseEvent<HTMLButtonElement>); // Call the function with simulated event
  };

  {
    /* Mobile navigation */
  }
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bluemarine shadow-md">
      <div className="flex justify-around p-4">
        <Button
          name="Cube"
          variant={cubeType === "Cube" ? "contained" : "outlined"}
          onClick={() => handleClick("Cube")}
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
          variant={cubeType === "BattleBox" ? "contained" : "outlined"}
          onClick={() => handleClick("BattleBox")}
          className={`${
            cubeType === "BattleBox"
              ? "bg-gray-500 text-white"
              : "bg-transparent text-gray-500 border border-gray-500"
          } hover:bg-gray-400 hover:text-white transition-all duration-300`}
        >
          BattleBox
        </Button>
      </div>
    </nav>
  );
};
