import React from "react";
import { useRouter } from "next/router"; // Import useRouter from Next.js
import Image from "next/image";
import Link from "next/link"; // Change to Link from next/link
import cubesList from "@/data/cubes.json";
import { ChevronLeft, Star } from "lucide-react";
import YourComponent, { CubeItem } from "@/components/Tabs/Tabs";
import { cubeCobraUrl } from "@/utils/cubeCobraUrl";
import { Header } from "@/components/Header/Header"; // Import Header
import { Footer } from "@/components/Footer/Footer"; // Import Footer
import { HeaderCubeDetail } from "@/components/Header/HeaderCubeDetail";
import "../../app/globals.css";

const CubeDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Extract the id from the query

  // Fetch or find the cube item based on the id (this could be from a JSON file or an API)
  const cubeItem = cubesList.find((item) => item.id === id) as
    | CubeItem
    | undefined;

  if (!cubeItem) return <div>Loading...</div>; // Handle loading state or not found

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderCubeDetail />
      {/* Include Header */}
      <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-700 hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Cube Selection
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:flex-shrink-0">
              <Image
                src={cubeItem.image}
                alt={cubeItem.name}
                width={300}
                height={300}
                className="w-full h-64 object-cover md:w-64 md:h-full"
              />
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {cubeItem.name}
              </h2>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < cubeItem.difficulty ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <Link
                href={cubeCobraUrl(cubeItem.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on CubeCobra
              </Link>
            </div>
          </div>
        </div>

        <YourComponent cubeItem={cubeItem} />
      </main>
    </div>
  );
};

export default CubeDetail;
