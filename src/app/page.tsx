"use client";

import { useState } from "react";
import { Footer } from "../components/Footer/Footer";
import React from "react";
import { Header } from "@/components/Header/Header";
import CubeSelection from "@/pages/CubeSelection";
import axios from "axios";
import SplashScreen from "@/components/SplashScreeen/SplashScreen";

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

  interface SubmitDeckParams {
    deckName: string;
    deckList: string;
    headless?: boolean;
  }

  const submitDeck = async (params: SubmitDeckParams): Promise<void> => {
    try {
      const response = await axios.get("/api/uploadDeck", {
        params,
      });

      console.log(response.data.message); // "Deck submitted successfully!"
    } catch (error: any) {
      console.error(
        "Error submitting the deck:",
        error.response?.data?.error || error.message
      );
    }
  };

  const handleClick = () => {
    console.log(
      "process.env.ARCHIDEKT_USERNAME",
      process.env.ARCHIDEKT_USERNAME
    );
    submitDeck({
      deckName: crypto.randomUUID(),
      deckList: `4 Swamp
4 Island
2 Sorin, Imperious Bloodlord
4 Thoughtseize`,
    });
  };

  const [showContent, setShowContent] = useState(false);

  // Usage example
  return (
    <>
      {!showContent && <SplashScreen onFinish={() => setShowContent(true)} />}

      <div
        className={`transition-opacity duration-700 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Implementation of submit decks to platform (archiketk) */}
          {/* <button onClick={handleClick}>Submit Deck</button> */}
          <Header
            searchQuery={searchQuery}
            handleSearchInputChange={handleSearchInputChange}
            handleCubeTypeChange={handleCubeType}
            cubeType={cubeType}
          />
          <CubeSelection searchQuery={searchQuery} cubeType={cubeType} />
          <Footer handleCubeTypeChange={handleCubeType} cubeType={cubeType} />
        </div>
      </div>
    </>
  );
};

export default Home;
