export const getRankingOrder = (ranking: string | null): number => {
  const rankOrder: { [key: string]: number } = {
    'miss_france': 1,    // Miss France first
    'top5': 2,          // Top 5 next
    '1ere_dauphine': 3, // Then dauphines in order
    '2eme_dauphine': 4,
    '3eme_dauphine': 5,
    '4eme_dauphine': 6,
    'top15': 7,         // Top 15
  };
  return ranking ? rankOrder[ranking] || 8 : 8; // Unranked candidates last
};