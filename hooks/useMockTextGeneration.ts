import { useState } from 'react';

export function useTextGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = async (prompt: string, systemPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        text: "AI generation is currently disabled. Configure an AI provider (for example via a Supabase Edge Function) to enable this feature.",
      };
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generate,
    isLoading,
    error,
  };
}
