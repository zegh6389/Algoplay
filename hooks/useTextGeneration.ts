import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UseTextGenerationOptions = {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
};

type InvokeBody = {
  prompt: string;
  systemPrompt?: string;
};

// Opt-in AI. Default off so a fresh install doesn't depend on any external provider.
const AI_ENABLED = process.env.EXPO_PUBLIC_AI_ENABLED === 'true';
const AI_FUNCTION_NAME = process.env.EXPO_PUBLIC_AI_FUNCTION_NAME || 'ai-text';

function normalizeError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === 'string') return new Error(err);
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error('Unknown error');
  }
}

function getDisabledMessage(): string {
  return (
    "AI is disabled. To enable, set `EXPO_PUBLIC_AI_ENABLED=true` and " +
    `deploy a Supabase Edge Function named \"${AI_FUNCTION_NAME}\" that returns { text }.`
  );
}

export function useTextGeneration(options: UseTextGenerationOptions = {}) {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);

  useEffect(() => {
    onSuccessRef.current = options.onSuccess;
    onErrorRef.current = options.onError;
  }, [options.onSuccess, options.onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const generateText = useCallback(async (prompt: string, systemPrompt?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!AI_ENABLED) {
        const text = getDisabledMessage();
        setData(text);
        onSuccessRef.current?.(text);
        return text;
      }

      const { data: result, error: invokeError } = await supabase.functions.invoke(
        AI_FUNCTION_NAME,
        {
          body: { prompt, systemPrompt } satisfies InvokeBody,
        }
      );

      if (invokeError) throw invokeError;

      const text =
        (result as any)?.text ??
        (result as any)?.message ??
        (result as any)?.response ??
        (typeof result === 'string' ? result : JSON.stringify(result));

      setData(text);
      onSuccessRef.current?.(text);
      return text;
    } catch (err) {
      const e = normalizeError(err);
      setError(e);
      onErrorRef.current?.(e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateText,
    data,
    isLoading,
    error,
    reset,
  };
}

