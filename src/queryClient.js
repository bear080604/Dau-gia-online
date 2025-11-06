// src/queryClient.js
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,        // Dữ liệu tươi trong 1 phút
      cacheTime: 1000 * 60 * 10,   // Cache 10 phút
    },
  },
});

export default queryClient;