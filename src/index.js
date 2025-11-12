import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// === THÊM REACT QUERY ===
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient from './queryClient'; // <-- mới tạo

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Chỉ hiện khi dev */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  // {/* </React.StrictMode> */}
);

reportWebVitals();