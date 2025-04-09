"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link from Next.js

export const HeaderCubeDetail: React.FC = () => {
  return (
    <header className="bg-bluemarine shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Wrap the logo image with a Link to redirect to the main page */}
          <Link href="/">
            <Image
              src="/favicon.png"
              alt="Logo"
              width={120}
              height={120}
              className="cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
