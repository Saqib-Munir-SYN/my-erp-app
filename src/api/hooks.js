import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data from API
 * Handles loading, error, and data states
 * 
 * @param {Function} fetchFn - Async function that returns data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {object} options - Configuration options
 * @returns {object} - { data, loading, error, refetch }
 */
export function useFetch(fetchFn, dependencies = [], options = {}) {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}

/**
 * Custom hook for paginated API calls
 * Manages pagination state and data fetching
 */
export function usePaginatedFetch(fetchFn, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn(currentPage, itemsPerPage);
        setData(result.data || []);
        setTotalItems(result.pagination?.total || 0);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        console.error('Paginated fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

  return {
    data,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    goToPage: (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages)),
    nextPage: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
    prevPage: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
  };
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 * Handles loading, error, and success states
 */
export function useMutation(mutationFn, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState(false);

  const mutate = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const result = await mutationFn(payload);
      setData(result);
      setSuccess(true);
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      if (options.onError) {
        options.onError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
    setSuccess(false);
  };

  return { mutate, loading, error, data, success, reset };
}
