export const getRankingOrder = (ranking: string | null): number => {
  const rankingOrder: { [key: string]: number } = {
    'miss_france': 1,
    'top5': 2,
    '1ere_dauphine': 3,
    '2eme_dauphine': 4,
    '3eme_dauphine': 5,
    '4eme_dauphine': 6,
    'top15': 7,
    'inconnu': 8,
    'eliminee': 9
  };

  return rankingOrder[ranking || 'inconnu'] || 8; // Default to 'inconnu' order if ranking is null or unknown
};