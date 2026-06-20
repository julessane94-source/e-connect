// hooks/useApi.ts
import { useState, useCallback } from "react";
import axios from "axios";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (config: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios(config);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Une erreur est survenue");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
};
