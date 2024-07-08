import React from "react";

interface HeaderProps {
  searchQuery: string;
  handleSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  handleSearchInputChange,
}) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Cubes</h1>
      <div className="flex flex-col items-center p-1">
        <input
          type="text"
          placeholder="Search cubes..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="black border border-gray-300 rounded px-3 py-1 mb-2 text-black"
        />
      </div>
    </header>
  );
};

export default Header;
