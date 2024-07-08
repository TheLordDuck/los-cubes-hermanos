import cubesList from "@/data/cubes.json";

export const getCube = (id: string) => {
    const cube = cubesList.find((item) => item.id === id);

    return cube;
};
