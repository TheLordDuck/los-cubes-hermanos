export default function DraftTable() {
  const data = [
    {
      players: 3,
      packs: 8,
      cardsPerPack: 6,
      picks: 48,
      totalPacks: 24,
      totalCards: 144,
    },
    {
      players: 4,
      packs: 6,
      cardsPerPack: 8,
      picks: 48,
      totalPacks: 24,
      totalCards: 192,
    },
    {
      players: 5,
      packs: 6,
      cardsPerPack: 8,
      picks: 48,
      totalPacks: 30,
      totalCards: 240,
    },
    {
      players: 6,
      packs: 4,
      cardsPerPack: 12,
      picks: 48,
      totalPacks: 24,
      totalCards: 288,
    },
    {
      players: 7,
      packs: 4,
      cardsPerPack: 12,
      picks: 48,
      totalPacks: 28,
      totalCards: 336,
    },
    {
      players: 8,
      packs: 3,
      cardsPerPack: 15,
      picks: 45,
      totalPacks: 24,
      totalCards: 360,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="table-auto border border-gray-300 shadow-md rounded-lg text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-1 py-1 border">Players</th>
            <th className="px-1 py-1 border">Packs</th>
            <th className="px-1 py-1 border">Cards</th>
            <th className="px-1 py-1 border">Picks</th>
            <th className="px-1 py-1 border">Total Packs</th>
            <th className="px-1 py-1 border">Total Cards</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="text-center odd:bg-white even:bg-gray-50">
              <td className="px-1 py-1 border">{row.players}</td>
              <td className="px-1 py-1 border">{row.packs}</td>
              <td className="px-1 py-1 border">{row.cardsPerPack}</td>
              <td className="px-1 py-1 border">{row.picks}</td>
              <td className="px-1 py-1 border">{row.totalPacks}</td>
              <td className="px-1 py-1 border">{row.totalCards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
