
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
} catch (error) {
  console.error('Application initialization error:', error);
  
  // Fallback error display
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #6b7280;">Something went wrong. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
