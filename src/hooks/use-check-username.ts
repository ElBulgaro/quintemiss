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
      console.log('Moderation result:', result);
      
      return result;
    } catch (error) {
      console.error('Error checking username:', error);
      return { isInappropriate: false }; // Fail open to avoid blocking registration
    }
  };

  return { checkUsername };
}