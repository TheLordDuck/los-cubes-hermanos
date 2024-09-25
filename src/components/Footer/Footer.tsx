"use client";

import { WideFooter } from "./WideFooter";
import { MobileFooter } from "./MobileFooter";
import React from "react";

interface FooterProps {
  cubeType: string;
  handleCubeTypeChange: (event: React.MouseEvent<HTMLButtonElement>) => void; // Add the prop type
}

{
  /* Mobile navigation */
}
export const Footer: React.FC<FooterProps> = ({
  cubeType,
  handleCubeTypeChange,
}) => {
  return (
    <>
      <WideFooter></WideFooter>
      <MobileFooter
        cubeType={cubeType}
        handleCubeTypeChange={handleCubeTypeChange}
      />
    </>
  );
};
