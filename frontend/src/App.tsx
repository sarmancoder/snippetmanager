import {useState} from 'react';
import {Greet} from "../wailsjs/go/main/App";
import Editor from '@monaco-editor/react';

function App() {
    const [resultText, setResultText] = useState("Please enter your name below 👇");
    const [name, setName] = useState('');
    const updateName = (e: any) => setName(e.target.value);
    const updateResultText = (result: string) => setResultText(result);

    function greet() {
        Greet(name).then(updateResultText);
    }

    return (
        <div id="App">
            <p>Holaa</p>
            <Editor theme='vs-dark' height="200px" defaultLanguage="javascript" defaultValue="// some comment" />
            <iframe  width={1500} height={500} src='https://snipppeteditor.vercel.app/app'></iframe>
        </div>
    )
}

export default App
