export function useCheckUsername() {
  const checkUsername = async (username: string) => {
    try {
      console.log('Checking username:', username);
      
      const response = await fetch('/functions/v1/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to check username');
      }

      const result = await response.json();
      
      // Log detailed results
      if (result.isInappropriate) {
        console.warn('Username flagged as inappropriate:', {
          username,
          flaggedCategories: Object.entries(result.categories)
            .filter(([_, value]) => value)
            .map(([key]) => key),
          topScores: Object.entries(result.scores)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .slice(0, 3)
            .map(([key, value]) => `${key}: ${(Number(value) * 100).toFixed(2)}%`)
        });
      } else {
        console.log('Username passed moderation check:', username);
      }
      
      return result;
    } catch (error) {
      console.error('Error checking username:', error);
      return { isInappropriate: false }; // Fail open to avoid blocking registration
    }
  };

  return { checkUsername };
}