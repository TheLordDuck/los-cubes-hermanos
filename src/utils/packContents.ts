const generatePackContents = (packs: any, packNumber: string) => {
  const {
    common = 0,
    uncommon = 0,
    rare = 0,
    mythic = 0,
    random = 0,
    timeshifted = 0,
    rare_mythic = 0,
    white = 0,
    blue = 0,
    black = 0,
    red = 0,
    green = 0,
    artifact = 0,
    dedicatedmythic = 0,
    multicolor = 0,
    land = 0,
    artifact_land = 0,
    random_any_color = 0,
  } = packs[packNumber] || {};

  const packContents = [
    { type: "Common", count: common },
    { type: "Uncommon", count: uncommon },
    { type: "Rare", count: rare },
    { type: "Mythic", count: mythic },
    { type: "Random", count: random },
    { type: "Timeshifted", count: timeshifted },
    { type: "White", count: white },
    { type: "Blue", count: blue },
    { type: "Black", count: black },
    { type: "Red", count: red },
    { type: "Green", count: green },
    { type: "Artifact", count: artifact },
    {
      type: "DedicatedMythic",
      count: dedicatedmythic,
    },
    { type: "Multicolor", count: multicolor },
    { type: "Land", count: land },
    { type: "Artifact_Land", count: artifact_land },
    {
      type: "Random_Any_Color",
      count: random_any_color,
    },
    { type: "Rare_Mythic", count: rare_mythic },
  ];

  return packContents;
};

export { generatePackContents };
