"use client";

import { useState } from "react";
import { Footer } from "../components/Footer/Footer";
import React from "react";
import { Header } from "@/components/Header/Header";
import CubeSelection from "@/pages/CubeSelection";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cubeType, setCubeType] = useState("Cube");

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const handleCubeType = (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.currentTarget; // Using currentTarget for better clarity
    const selectedCubeType = target.name; // Get the name from the button
    setCubeType(selectedCubeType); // Update state with the selected cube type
    console.log("Selected cube type:", selectedCubeType); // Debugging log
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          searchQuery={searchQuery}
          handleSearchInputChange={handleSearchInputChange}
          handleCubeTypeChange={handleCubeType}
          cubeType={cubeType}
        />
        <CubeSelection searchQuery={searchQuery} cubeType={cubeType} />
        <Footer handleCubeTypeChange={handleCubeType} cubeType={cubeType} />
      </div>
    </>
  );
};

export default Home;
