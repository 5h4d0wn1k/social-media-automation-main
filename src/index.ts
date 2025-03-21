import { env } from './config/env';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const root = createRoot(document.getElementById('root')!);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    {env.IS_DEVELOPMENT && <ReactQueryDevtools />}
  </QueryClientProvider>
); 