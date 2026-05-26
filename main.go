package main

import (
	"context"
	"embed"
	"fmt"
	"snippetmanagerwails/ia"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	archivos := &AdministradorArchivos{}
	gestorColor := &GestorColor{}
	iAOpenRouter := &ia.IAOpenRouter{}
	iaOllama := &ia.IAOllama{}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "snippetmanagerwails",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			archivos.SetContext(ctx) // <--- ¡IMPORTANTE! Le pasamos el contexto
			gestorColor.SetContext(ctx)
		},
		OnDomReady: func(ctx context.Context) {
			color := gestorColor.CambiarColorHex()
			script := fmt.Sprintf("document.documentElement.style.setProperty('--main-color', '%s');", color)
			wailsRuntime.WindowExecJS(ctx, script)
		},
		Bind: []interface{}{
			app,
			archivos,
			gestorColor,
			iaOllama,
			iAOpenRouter,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
