import { FaSun, FaMoon } from "react-icons/fa"
import { useTheme } from "next-themes"

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div onClick={() => setTheme(theme == 'light' ? 'dark' : 'light')} className="cursor-pointer text-2xl text-white">
      {theme == 'light' && <FaSun />}
      {theme == 'dark' && <FaMoon />}
      <span className="sr-only">Toggle theme</span>
    </div>
  )
}