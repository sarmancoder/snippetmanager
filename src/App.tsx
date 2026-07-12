import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";

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
    </main>
  );
}

export default App;
