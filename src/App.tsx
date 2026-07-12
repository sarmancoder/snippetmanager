import LayoutApp from "./components/layout/layout";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import "./styles.css";

function App() {
  return (
    <ThemeProvider>
      <LayoutApp>
        <p>Holaa</p>
      </LayoutApp>
    </ThemeProvider>
  );
}

export default App;
