import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: {
    light: true, dark: true
  },
  cssVariables: {
    colorSchemeSelector: 'class'
  }
});
export default function MyMuiThemeProvider({ children }) {

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}