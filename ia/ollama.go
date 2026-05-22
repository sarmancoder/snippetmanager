package ia

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// IAOllama es el nuevo struct independiente para manejar la IA
type IAOllama struct {
	ctx context.Context
}

// OllamaResponse mapea la respuesta de la API de Ollama
type OllamaResponse struct {
	Message struct {
		Content string `json:"content"`
	} `json:"message"`
}

var url string = "http://localhost:11434/api/chat"

// PreguntarOllama envía la consulta utilizando Structured Outputs
func (f *IAOllama) PreguntarOllama(modelo string, pregunta string) (*SnippetState, error) {

	// Esquema estricto para forzar a Ollama a responder con la estructura correcta
	jsonSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"prefix":      map[string]string{"type": "string"},
			"description": map[string]string{"type": "string"},
			"scope":       map[string]string{"type": "string"},
			"body": map[string]interface{}{
				"type": "array",
				"items": map[string]string{
					"type": "string",
				},
			},
			"isFileTemplate": map[string]string{"type": "boolean"},
		},
		"required": []string{"prefix", "description", "scope", "body", "isFileTemplate"},
	}

	payload := map[string]interface{}{
		"model":  modelo,
		"stream": false,
		"messages": []map[string]interface{}{
			{
				"role":    "system",
				"content": "Eres un asistente experto en programación que genera snippets de código estructurados en JSON. Cada línea del snippet debe ser un elemento separado dentro del array 'body'.",
			},
			{
				"role":    "user",
				"content": pregunta,
			},
		},
		"format": jsonSchema,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("error al serializar el payload: %w", err)
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("error al conectar con Ollama: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer la respuesta: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama devolvió un estado de error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var ollamaResp OllamaResponse
	if err := json.Unmarshal(bodyBytes, &ollamaResp); err != nil {
		return nil, fmt.Errorf("error al deserializar la respuesta de Ollama: %w", err)
	}

	var snippet SnippetState
	if err := json.Unmarshal([]byte(ollamaResp.Message.Content), &snippet); err != nil {
		return nil, fmt.Errorf("error al mapear a SnippetState: %w. Contenido: %s", err, ollamaResp.Message.Content)
	}

	return &snippet, nil
}

// PreguntarVariosOllama envía la consulta utilizando Structured Outputs para devolver una lista de snippets
func (f *IAOllama) PreguntarVariosOllama(modelo string, pregunta string) ([]SnippetState, error) {
	// Esquema para forzar a Ollama a responder con un objeto que contiene un ARRAY de snippets
	jsonSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"snippets": map[string]interface{}{
				"type": "array",
				"items": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"prefix":      map[string]string{"type": "string"},
						"description": map[string]string{"type": "string"},
						"scope":       map[string]string{"type": "string"},
						"body": map[string]interface{}{
							"type": "array",
							"items": map[string]string{
								"type": "string",
							},
						},
						"isFileTemplate": map[string]string{"type": "boolean"},
					},
					"required": []string{"prefix", "description", "scope", "body", "isFileTemplate"},
				},
			},
		},
		"required": []string{"snippets"},
	}

	payload := map[string]interface{}{
		"model":  modelo,
		"stream": false,
		"messages": []map[string]interface{}{
			{
				"role":    "system",
				"content": "Eres un asistente experto en programación que genera listas de snippets de código estructurados en JSON. Genera tantos snippets como tenga sentido para la petición. Cada línea del snippet debe ser un elemento separado dentro del array 'body'.",
			},
			{
				"role":    "user",
				"content": pregunta,
			},
		},
		"format": jsonSchema,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("error al serializar el payload: %w", err)
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("error al conectar con Ollama: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer la respuesta: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama devolvió un estado de error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var ollamaResp OllamaResponse
	if err := json.Unmarshal(bodyBytes, &ollamaResp); err != nil {
		return nil, fmt.Errorf("error al deserializar la respuesta de Ollama: %w", err)
	}

	// Estructura temporal para desempaquetar la propiedad "snippets" de la respuesta
	var wrapper struct {
		Snippets []SnippetState `json:"snippets"`
	}

	if err := json.Unmarshal([]byte(ollamaResp.Message.Content), &wrapper); err != nil {
		return nil, fmt.Errorf("error al mapear a lista de SnippetState: %w. Contenido: %s", err, ollamaResp.Message.Content)
	}

	return wrapper.Snippets, nil
}

// OllamaModelsResponse representa la respuesta del endpoint /api/tags de Ollama
type OllamaModelsResponse struct {
	Models []OllamaModel `json:"models"`
}

// ListarModelosOllama obtiene los modelos que están instalados en la instancia local de Ollama
func (f *IAOllama) ListarModelosOllama() ([]OllamaModel, error) {
	// Reemplazamos /api/chat por /api/tags
	urlModelos := "http://localhost:11434/api/tags"

	resp, err := http.Get(urlModelos)
	if err != nil {
		return nil, fmt.Errorf("error al conectar con Ollama para listar modelos: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer los modelos de Ollama: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama devolvió un estado de error al listar modelos (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var modelosResp OllamaModelsResponse
	if err := json.Unmarshal(bodyBytes, &modelosResp); err != nil {
		return nil, fmt.Errorf("error al deserializar los modelos de Ollama: %w", err)
	}

	return modelosResp.Models, nil
}
