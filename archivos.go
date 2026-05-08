package main

import (
    "os"
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type AdministradorArchivos struct {
	ctx context.Context
}

// Función para que Wails le pase el contexto (se llama desde main.go)
func (f *AdministradorArchivos) SetContext(ctx context.Context) {
	f.ctx = ctx
}

// SeleccionarYLeerCarpeta abre el picker y devuelve los archivos
func (f *AdministradorArchivos) SeleccionarYLeerCarpeta() ([]string, error) {
	// 1. Abrir el diálogo nativo para seleccionar directorio
	ruta, err := runtime.OpenDirectoryDialog(f.ctx, runtime.OpenDialogOptions{
		Title: "Selecciona una carpeta de Snippets",
	})

	if err != nil || ruta == "" {
		return nil, err // Si cancela o hay error
	}

	// 2. Ahora que tenemos la ruta, leemos los archivos
	entradas, err := os.ReadDir(ruta)
	if err != nil {
		return nil, err
	}

	var nombres []string
	for _, entrada := range entradas {
		nombres = append(nombres, entrada.Name())
	}

	return nombres, nil
}