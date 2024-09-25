"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@mui/material";

export const HeaderCubeDetail: React.FC = ({}) => {
  return (
    <header className="bg-bluemarine shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/favicon.png" alt="Logo" width={40} height={40} />
        </div>
      </div>
    </header>
  );
};
