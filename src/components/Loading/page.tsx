"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { HeaderCubeDetail } from "../Header/HeaderCubeDetail";

export const Loading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderCubeDetail />
      <div className="text-center py-8">Loading...</div>{" "}
      {/* Optional loading message */}
    </div>
  );
};
