interface ScoreResult {
  score: number;
  perfectMatch: boolean;
}

export const calculateScore = (
  predictions: string[], 
  officialRanking: string[],
  semiFinalists: string[] = []
): ScoreResult => {
  console.log('Calculating score with:', {
    predictions,
    officialRanking,
    semiFinalists
  });

  let score = 0;
  let correctPositions = 0;

  // Points for candidates in top 15 (semi-finalists) - unordered
  predictions.forEach(candidateId => {
    if (semiFinalists.includes(candidateId)) {
      score += 10;
      console.log(`+10 points for semi-finalist: ${candidateId}`);
    }
  });

  // Points for candidates in top 5 - unordered
  predictions.forEach(candidateId => {
    if (officialRanking.includes(candidateId)) {
      score += 20;
      console.log(`+20 points for top 5: ${candidateId}`);
    }
  });

  // Points for exact positions in top 5
  predictions.forEach((candidateId, index) => {
    if (officialRanking[index] === candidateId) {
      score += 50;
      correctPositions++;
      console.log(`+50 points for correct position ${index + 1}: ${candidateId}`);
    }
  });

  // Winner bonus (correctly predicting Miss France)
  if (predictions[0] === officialRanking[0]) {
    score += 50;
    console.log(`+50 points for winner bonus: ${predictions[0]}`);
  }

  // Perfect match bonus (all 5 positions correct)
  const perfectMatch = correctPositions === 5;
  if (perfectMatch) {
    score += 200;
    console.log('+200 points for perfect match bonus');
  }

  console.log('Final score calculation:', {
    score,
    perfectMatch,
    correctPositions
  });

  return {
    score,
    perfectMatch
  };
};