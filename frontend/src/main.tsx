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
        <AppContextProvider>
            <MyMuiThemeProvider>
                <I18nProviderContextProvider>
                    <LayoutApp>
                        <App />
                    </LayoutApp>
                </I18nProviderContextProvider>
            </MyMuiThemeProvider>
        </AppContextProvider>
    </React.StrictMode>
)
