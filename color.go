package main

import (
	"context"
	"fmt"
	goruntime "runtime"

	"golang.org/x/sys/windows/registry"
)

type GestorColor struct {
	ctx context.Context
}

func (g *GestorColor) SetContext(ctx context.Context) {
	g.ctx = ctx
}

// ObtenerColorEnfasisSistema detecta el color de Windows o macOS
func ObtenerColorEnfasisSistema() string {
	// Por defecto usamos tu color tomato como fallback por si algo falla
	colorHex := "#e24c4c"

	// Si el usuario está en Windows
	if goruntime.GOOS == "windows" {
		// Leemos la clave del registro donde Windows guarda el color de énfasis en formato ABGR/RGBA hex
		k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\DWM`, registry.QUERY_VALUE)
		if err == nil {
			defer k.Close()
			val, _, err := k.GetIntegerValue("AccentColor")
			if err == nil {
				// El valor viene como un número uint32 (formato ABGR: Alfa, Azul, Verde, Rojo)
				// Lo convertimos a formato CSS Hex estándar (#RRGGBB) ignorando el canal alfa
				r := val & 0xFF
				g := (val >> 8) & 0xFF
				b := (val >> 16) & 0xFF
				colorHex = fmt.Sprintf("#%02x%02x%02x", r, g, b)
			}
		}
	}

	// Si el usuario está en macOS (opcional, por si compilas para Mac)
	if goruntime.GOOS == "darwin" {
		// Nota: En macOS leerlo requiere ejecutar un comando de "defaults read"
		// o usar Cgo. Si necesitas soporte estricto para Mac me avisas y te paso el código.
	}

	return colorHex
}

func (g *GestorColor) CambiarColorHex() string {
	color := ObtenerColorEnfasisSistema()
	return color
}
