import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";
import { Button } from "./components/ui/button";

function App() {
  const [message, setMessage] = useState('')
  return (
    <main>
      <p>Holaa</p>
      <button onClick={() => {
        invoke<string>('greet', {name: 'Raúl'}).then((r) => {
          console.log(r)
          setMessage(r)
        })
      }}>
        llamar
      </button>
      <span>{message}</span>
      <h1 className="text-2xl">tailwind instalado</h1>
      <Button>Hola shadcn</Button>
    </main>
  );
}

export default App;
