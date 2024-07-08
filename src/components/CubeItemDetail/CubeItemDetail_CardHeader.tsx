"use client";

import { useSearchParams } from "next/navigation";
import {
  CardContent,
  CardMedia,
  Button,
  Rating,
  Typography,
} from "@mui/material";
import cubesList from "@/data/cubes.json";

const CardDetail_Intro = () => {
  const params = useSearchParams();

  const getCube = (id: string) => {
    const cube = cubesList.find((item) => item.id === id);

    return cube;
  };

  const id = params.get("id");
  const cube = getCube(id as string);

  return (
    <div className="flex flex-row align-middle">
      <CardMedia
        sx={{ maxWidth: 150, maxHeight: 300 }}
        className="content-center	"
        component="img"
        height="140"
        image={cube?.image || ""}
        alt="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {cube?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Rating
            name="read-only"
            precision={0.5}
            value={Number(cube?.difficulty)}
            readOnly
          />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Button
            href={`https://cubecobra.com/cube/overview/${id}`}
            size="small"
            color="primary"
          >
            CubeCobra Link
          </Button>
        </Typography>
      </CardContent>
    </div>
  );
};

export default CardDetail_Intro;
