"use client";

import React from "react";
import HomeImage from "../HomeImage";

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <HomeImage />
    </header>
  );
};

export default Header;
