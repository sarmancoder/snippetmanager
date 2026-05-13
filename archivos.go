package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	goruntime "runtime"

	"github.com/wailsapp/wails/v2/pkg/runtime" // Este es el de Wails
)

// Estructura para devolver datos combinados al frontend
type ResultadoCarpeta struct {
	Ruta     string   `json:"ruta"`
	Archivos []string `json:"archivos"`
}

type AdministradorArchivos struct {
	ctx context.Context
}

func (f *AdministradorArchivos) SetContext(ctx context.Context) {
	f.ctx = ctx
}

// UnirRutas recibe un array de strings desde el frontend y los une
func (f *AdministradorArchivos) UnirRutas(partes []string) string {
	return filepath.Join(partes...)
}

func (f *AdministradorArchivos) SeleccionarYLeerCarpeta() (*ResultadoCarpeta, error) {
	// 1. Abrir selector de carpeta
	ruta, err := runtime.OpenDirectoryDialog(f.ctx, runtime.OpenDialogOptions{
		Title: "Seleccionar carpeta de Snippets",
	})

	if err != nil {
		return nil, err
	}

	if ruta == "" {
		return nil, nil // El usuario canceló
	}

	// 2. Leer los archivos
	entradas, err := os.ReadDir(ruta)
	if err != nil {
		return nil, err
	}

	var nombres []string
	for _, entrada := range entradas {
		nombres = append(nombres, entrada.Name())
	}

	// 3. Devolvemos el objeto con ambos datos
	return &ResultadoCarpeta{
		Ruta:     ruta,
		Archivos: nombres,
	}, nil
}

func (f *AdministradorArchivos) AbrirCarpetaEnExplorador(ruta string) {
	var cmd *exec.Cmd

	// Usamos el alias para que no choque con el runtime de Wails
	switch goruntime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", ruta)
	case "darwin":
		cmd = exec.Command("open", ruta)
	default: // Linux
		cmd = exec.Command("xdg-open", ruta)
	}

	if cmd != nil {
		cmd.Run()
	}
}

func (f *AdministradorArchivos) LeerArchivo(ruta string) (string, error) {
	data, err := os.ReadFile(ruta)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

func (f *AdministradorArchivos) EscribirArchivo(ruta string, contenido string) error {
	err := os.WriteFile(ruta, []byte(contenido), 0644)

	if err != nil {
		log.Printf("ERROR: %v", err)
		return fmt.Errorf("error al escribir en el archivo: %w", err)
	}

	runtime.LogInfo(f.ctx, "Archivo procesado exitosamente: "+ruta)
	return nil
}

func (f *AdministradorArchivos) EliminarArchivo(ruta string) error {
	log.Printf("Intentando eliminar: %s", ruta)

	err := os.Remove(ruta)
	if err != nil {
		log.Printf("Error al eliminar archivo: %v", err)
		return fmt.Errorf("no se pudo eliminar el archivo: %w", err)
	}

	runtime.LogInfo(f.ctx, "Archivo eliminado: "+ruta)
	return nil
}

// Snippet representa la estructura interna de cada snippet de VS Code, ahora con descripción
type Snippet struct {
	Prefix      string   `json:"prefix"`
	Scope       string   `json:"scope"`
	Description string   `json:"description,omitempty"` // omitempty hace que si está vacío, no se guarde en el JSON (opcional)
	Body        []string `json:"body"`
}

// AgregarSnippet lee el JSON existente, parsea el nuevo snippet desde un string, y lo añade usando su Prefix como llave.
func (f *AdministradorArchivos) AgregarSnippet(ruta string, nuevoSnippetJSON string) error {
	// 1. Parsear el string recibido a la estructura Snippet
	var nuevoSnippet Snippet
	err := json.Unmarshal([]byte(nuevoSnippetJSON), &nuevoSnippet)
	if err != nil {
		return fmt.Errorf("el string del nuevo snippet no tiene un formato JSON válido: %w", err)
	}

	// Validar que al menos venga el prefix
	if nuevoSnippet.Prefix == "" {
		return fmt.Errorf("el snippet provisto no contiene un campo 'prefix' válido")
	}

	// 2. Leer el archivo JSON existente
	contenidoBytes, err := os.ReadFile(ruta)
	if err != nil {
		if os.IsNotExist(err) {
			contenidoBytes = []byte("{}")
		} else {
			return fmt.Errorf("error al leer el archivo: %w", err)
		}
	}

	// 3. Parsear el JSON del archivo actual en un mapa
	var snippetsExistentes map[string]Snippet
	err = json.Unmarshal(contenidoBytes, &snippetsExistentes)
	if err != nil {
		return fmt.Errorf("error al deserializar el JSON actual del archivo: %w", err)
	}

	if snippetsExistentes == nil {
		snippetsExistentes = make(map[string]Snippet)
	}

	// 4. Añadir o actualizar el snippet usando el prefix como llave
	snippetsExistentes[nuevoSnippet.Prefix] = nuevoSnippet

	// 5. Convertir el mapa de vuelta a JSON con indentación
	nuevoJSON, err := json.MarshalIndent(snippetsExistentes, "", "    ")
	if err != nil {
		return fmt.Errorf("error al serializar el nuevo JSON completo: %w", err)
	}

	// 6. Guardar el archivo actualizado
	err = os.WriteFile(ruta, nuevoJSON, 0644)
	if err != nil {
		return fmt.Errorf("error al escribir el archivo actualizado: %w", err)
	}

	return nil
}
