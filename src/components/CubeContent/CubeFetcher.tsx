import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const CubeFetcher = ({ cubeId }: { cubeId: string }) => {
  const [cubeContent, setCubeContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCubeContent = async () => {
      try {
        const response = await fetch(`/api/fetchCubeContent?id=${cubeId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("Data received from CubeCobra:", data);

        setCubeContent(data.description || "No description found.");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    };

    fetchCubeContent();
  }, [cubeId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!cubeContent) {
    return <div>Loading...</div>;
  }

  const formattedContent = cubeContent
    .replace(/\n\n/g, "\n\n") // Keep double newlines for Markdown paragraphs
    .replace(/\n/g, "  \n"); // Use two spaces followed by a newline for Markdown line breaks

  return (
    <div>
      <ReactMarkdown>{formattedContent}</ReactMarkdown>
    </div>
  );
};

export default CubeFetcher;
