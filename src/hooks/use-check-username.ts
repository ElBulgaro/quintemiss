export function useCheckUsername() {
  const checkUsername = async (username: string) => {
    try {
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

      return await response.json();
    } catch (error) {
      console.error('Error checking username:', error);
      return { isInappropriate: false }; // Fail open to avoid blocking registration
    }
  };

  return { checkUsername };
}