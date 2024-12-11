interface ScoreResult {
  score: number;
  perfectMatch: boolean;
}

export function calculateScore(predictions: string[], officialRanking: string[]): ScoreResult {
  let score = 0;
  let correctPositions = 0;

  // Points for correct candidates in top 5 (regardless of position)
  predictions.forEach(candidateId => {
    if (officialRanking.includes(candidateId)) {
      score += 10;
    }
  });

  // Additional points for correct positions
  predictions.forEach((candidateId, index) => {
    if (officialRanking[index] === candidateId) {
      score += 5;
      correctPositions++;
    }
  });

  // Bonus points for perfect prediction
  const perfectMatch = correctPositions === 5;
  if (perfectMatch) {
    score += 25;
  }

  return {
    score,
    perfectMatch
  };
}