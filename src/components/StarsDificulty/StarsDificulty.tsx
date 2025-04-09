import { Star } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface DifficultyProps {
  difficulty: number; // Difficulty is a number, not a props object
}

export const StarsDifficulty: React.FC<DifficultyProps> = ({ difficulty }) => {
  return (
    <div className="flex items-center mb-2">
      {[...Array(5)].map((_, i) => {
        const full = i + 1 <= difficulty;
        const half = i + 0.5 <= difficulty && !full;

        return (
          <span key={i} className="text-yellow-400">
            {full ? (
              <FaStar className="w-5 h-5" />
            ) : half ? (
              <FaStarHalfAlt className="w-5 h-5" />
            ) : (
              <FaRegStar className="w-5 h-5 text-gray-300" />
            )}
          </span>
        );
      })}
    </div>
  );
};
