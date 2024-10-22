"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Render 404 Content */}
      <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          404 - Cube Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The cube you&apos;re looking for doesn&apos;t exist. It may have been
          removed or the URL is incorrect.
        </p>

        {/* Optional back link */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-700 hover:underline mt-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Cube Selection
        </Link>
      </main>

      {/* Optional Footer */}
    </div>
  );
};
