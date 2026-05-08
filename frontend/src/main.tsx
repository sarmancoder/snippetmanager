import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'
import LayoutApp from './layout'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <LayoutApp>
            <App/>
        </LayoutApp>
    </React.StrictMode>
)
