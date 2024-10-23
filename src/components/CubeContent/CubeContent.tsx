import React from "react";
import CubeFetcher from "./CubeFetcher";

interface CubeContentProps {
  cubeId: string;
}

const CubeContent: React.FC<CubeContentProps> = ({ cubeId }) => {
  return (
    <>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">
        Rules and Notes
      </h3>
      <div className="container py-2">
        <div className="bg-gray-100 p-0 text-gray-900 rounded-lg shadow-md">
          <div className="container py-2">
            <CubeFetcher cubeId={cubeId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CubeContent;
