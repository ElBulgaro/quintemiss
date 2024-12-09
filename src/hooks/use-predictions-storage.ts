import { useState, useEffect } from 'react';

export const usePredictionsStorage = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  useEffect(() => {
    // Load saved predictions on component mount
    const savedPredictions = localStorage.getItem('predictions');
    if (savedPredictions) {
      setSelectedCandidates(JSON.parse(savedPredictions));
    }
  }, []);

  const updatePredictions = (predictions: string[]) => {
    setSelectedCandidates(predictions);
    localStorage.setItem('predictions', JSON.stringify(predictions));
  };

  const clearPredictions = () => {
    localStorage.removeItem('predictions');
    setSelectedCandidates([]);
  };

  return {
    selectedCandidates,
    updatePredictions,
    clearPredictions,
  };
};