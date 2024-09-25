import { Star } from "lucide-react";

interface DifficultyProps {
  difficulty: number; // Difficulty is a number, not a props object
}

export const StarsDifficulty: React.FC<DifficultyProps> = ({ difficulty }) => {
  return (
    <div className="flex items-center mb-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < difficulty ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
};
