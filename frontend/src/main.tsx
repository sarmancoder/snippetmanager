import './style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AppContextProvider from './AppSnippetsContext'
import LayoutApp from './layout'
import MyMuiThemeProvider from './components/MyMuiThemeProvider'
import I18nProviderContextProvider from './I18nProvider'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <I18nProviderContextProvider>
            <AppContextProvider>
                <MyMuiThemeProvider>
                    <LayoutApp>
                        <App />
                    </LayoutApp>
                </MyMuiThemeProvider>
            </AppContextProvider>
        </I18nProviderContextProvider>
    </React.StrictMode>
)
