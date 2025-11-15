import React, { useEffect, useState } from "react"; // Import useState and useEffect
import { useRouter } from "next/router"; // Import useRouter from Next.js
import Image from "next/image";
import Link from "next/link"; // Change to Link from next/link
import cubesList from "@/data/cubes.json";
import { ChevronLeft, Star } from "lucide-react";
import YourComponent, { CubeItem } from "@/components/Tabs/Tabs";
import { cubeCobraUrl } from "@/utils/cubeCobraUrl";
import { HeaderCubeDetail } from "@/components/Header/HeaderCubeDetail";
import "../../app/globals.css";
import { NotFound } from "@/components/404/page";
import { Loading } from "@/components/Loading/page";
import { StarsDifficulty } from "@/components/StarsDificulty/StarsDificulty";

const CubeDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Extract the id from the query
  const [loading, setLoading] = useState(true); // State to handle loading
  const [cubeItem, setCubeItem] = useState<CubeItem | undefined>(undefined); // State to hold the cube item

  useEffect(() => {
    if (id) {
      const foundCubeItem = cubesList.find(
        (item) => item.id === id
      ) as CubeItem;
      setCubeItem(foundCubeItem);
      setLoading(false); // Set loading to false once the data is fetched
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderCubeDetail />
        <Loading />;
      </div>
    );
  }

  if (!cubeItem) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderCubeDetail />
        <NotFound />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderCubeDetail />
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
            <div className="md:flex-shrink-0 relative">
              {cubeItem.isTwobert && (
                <div
                  className="absolute top-2 left-2 bg-cyan-800 text-white text-xs font-semibold px-2 py-1 rounded-md shadow border border-black"
                  title="This cube is a twobert"
                >
                  Twobert
                </div>
              )}

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
                <StarsDifficulty difficulty={cubeItem.difficulty} />
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
