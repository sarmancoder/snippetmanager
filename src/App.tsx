import LayoutApp from "./components/layout/layout";
import AppProviderContextProvider from "./components/providers/AppProvider";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import "./styles.css";

function App() {
  return (
    <ThemeProvider>
      <AppProviderContextProvider>
        <LayoutApp>
          <p>Holaa</p>
        </LayoutApp>
      </AppProviderContextProvider>
    </ThemeProvider>
  );
}

export default App;
