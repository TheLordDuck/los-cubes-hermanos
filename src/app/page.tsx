"use client";

import { useState } from "react";
import { Footer } from "../components/Footer/Footer";
import React from "react";
import { Header } from "@/components/Header/Header";
import CubeSelection from "@/pages/CubeSelection";
import axios from "axios";
import SplashScreen from "@/components/SplashScreeen/SplashScreen";
import { CubeType } from "@/utils/cubeTypes";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cubeType, setCubeType] = useState(CubeType.Cube);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Record<string, number>>({});

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const handleCubeType = (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.currentTarget; // Using currentTarget for better clarity
    const selectedCubeType: CubeType = target.name as CubeType; // Get the name from the button
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

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("deckImage", file);

    const res = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
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
          {/* Implementation ocr reading decklist from image */}
          {/*
          <div>
            <h1>Upload Your Deck Image</h1>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button color="red" onClick={handleUpload}>
              Upload
            </button>

            <h2>Detected Cards</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
          */}

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
