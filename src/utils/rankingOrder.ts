export const getRankingOrder = (ranking: string | null): number => {
  const rankOrder: { [key: string]: number } = {
    'miss_france': 1,
    '1ere_dauphine': 2,
    '2eme_dauphine': 3,
    '3eme_dauphine': 4,
    '4eme_dauphine': 5,
    'top5': 6,
    'top15': 7,
  };
  return ranking ? rankOrder[ranking] || 8 : 8;
};