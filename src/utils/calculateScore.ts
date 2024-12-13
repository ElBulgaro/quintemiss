interface ScoreResult {
  score: number;
  perfectMatch: boolean;
}

export function calculateScore(predictions: string[], officialRanking: string[], semiFinalists: string[] = []): ScoreResult {
  let score = 0;
  let correctPositions = 0;

  // Points for candidates in top 15 (semi-finalists)
  predictions.forEach(candidateId => {
    if (semiFinalists.includes(candidateId)) {
      score += 10;
    }
  });

  // Additional points for candidates in top 5
  predictions.forEach(candidateId => {
    if (officialRanking.includes(candidateId)) {
      score += 20;
    }
  });

  // Points for exact positions in top 5
  predictions.forEach((candidateId, index) => {
    if (officialRanking[index] === candidateId) {
      score += 50;
      correctPositions++;
    }
  });

  // Bonus points for correctly predicting the winner (first position)
  if (predictions[0] === officialRanking[0]) {
    score += 100;
  }

  // Bonus points for perfect prediction of top 5
  const perfectMatch = correctPositions === 5;
  if (perfectMatch) {
    score += 200;
  }

  return {
    score,
    perfectMatch
  };
}