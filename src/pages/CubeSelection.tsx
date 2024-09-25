"use client";

import React from "react";
import Image from "next/image";
import { Button, Input, Link } from "@mui/material";
import { Search, Star } from "lucide-react";
import cubesList from "@/data/cubes.json";
import { cubeCobraUrl } from "../utils/cubeCobraUrl";
import { useRouter } from "next/navigation";
import { StarsDifficulty } from "@/components/StarsDificulty/StarsDificulty";

interface CubeListProps {
  searchQuery: string;
  cubeType: string;
}

const CubeSelection: React.FC<CubeListProps> = ({ searchQuery, cubeType }) => {
  const router = useRouter(); // Initialize router

  const cubes = cubesList.filter((cubeItem) => cubeItem.type === cubeType);

  const filteredCubes = cubes.filter((cubeItem) =>
    cubeItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (id: string) => {
    // Navigate to CubeDetail with the given id
    router.push(`/cube/${id}`);
  };

  return (
    <main className="flex-grow container mx-auto p-4 pb-24 md:pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCubes.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" // Add cursor-pointer for better UX
            onClick={() => handleCardClick(item.id)} // Attach click handler
          >
            <div className="sm:hidden">
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-black">
                  {item.name}
                </h2>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < item.difficulty ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <Link
                  href={cubeCobraUrl(item.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on CubeCobra
                </Link>
              </div>
            </div>
            <div className="hidden sm:block">
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-black">
                  {item.name}
                </h2>
                <StarsDifficulty difficulty={item.difficulty} />
                <Link
                  href={cubeCobraUrl(item.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on CubeCobra
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

// Default export
export default CubeSelection;
