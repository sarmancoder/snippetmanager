import { Toaster } from "sonner";
import LayoutApp from "./components/layout/layout";
import AppProviderContextProvider from "./components/providers/AppProvider";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import "./styles.css";

function App() {
  return (
    <ThemeProvider>
      <AppProviderContextProvider>
        <LayoutApp />
        <Toaster position="top-center"
          toastOptions={{
            // Estilos base para todos los toasts
            classNames: {
              toast: 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-lg shadow-lg p-4',
              description: 'text-zinc-400 text-xs',
              actionButton: 'bg-indigo-600 hover:bg-indigo-500 text-white',

              // 👇 ESTILOS ESPECÍFICOS PARA ERRORES (Rojo)
              error: 'bg-red-950/40 text-red-200 border-red-500/30',
            },
          }}
        />
      </AppProviderContextProvider>
    </ThemeProvider>
  );
}

export default App;
