import { createTheme, ScopedCssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { useAppContext } from "../AppSnippetsContext";


export default function MyMuiThemeProvider({children}) {
  const {paletteMode} = useAppContext()
  console.log('color mode', paletteMode)

  const theme = createTheme({
    cssVariables: true,
    palette: {
      mode: paletteMode
    }
  });

  return (
    <StyledEngineProvider injectFirst>
      <ScopedCssBaseline>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>;
      </ScopedCssBaseline>
    </StyledEngineProvider>
  )
}