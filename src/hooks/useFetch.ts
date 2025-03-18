/**
 * useFetch hook
 * 
 * A custom hook for data fetching with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseFetchOptions {
  initialFetch?: boolean;
  dependencies?: any[];
}

/**
 * Custom hook for data fetching with loading and error states
 * 
 * @param fetchFn - The function to fetch data
 * @param options - Options for the hook
 * @returns Object containing data, loading state, error state, and a refetch function
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  var { initialFetch = true, dependencies = [] } = options;
  
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: initialFetch,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('[DEBUG] useFetch: Starting fetch operation');
      const data = await fetchFn();
      console.log('[DEBUG] useFetch: Fetch successful, data received:', data);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (error) {
      console.error('[DEBUG] useFetch: Fetch operation failed:', error);
      
      // More detailed error logging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[DEBUG] useFetch: Network error detected. Possible causes:');
        console.error('  - Server not running');
        console.error('  - CORS issues');
        console.error('  - Network connectivity problems');
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, [fetchFn, ...dependencies]);

  useEffect(() => {
    if (initialFetch) {
      fetchData().catch(error => {
        console.error('Error fetching data:', error);
      });
      initialFetch = false;
    }
  }, []);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Custom hook for data mutation with loading and error states
 * 
 * @param mutateFn - The function to mutate data
 * @returns Object containing mutation function, loading state, and error state
 */
export function useMutation<T, D = any>(
  mutateFn: (data: D) => Promise<T>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (mutateData: D) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutateFn(mutateData);
      setData(result);
      setIsLoading(false);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      setIsLoading(false);
      throw errorObj;
    }
  };

  return {
    mutate,
    isLoading,
    error,
    data,
  };
}