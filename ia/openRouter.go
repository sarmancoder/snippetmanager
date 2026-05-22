package ia

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"snippetmanagerwails/storage"
)

// IAOpenRouter mantiene las firmas idénticas (puedes renombrar el struct si quieres,
// pero lo dejo igual para respetar la firma exacta que pediste)
type IAOpenRouter struct {
	ctx context.Context
}

// OpenRouterResponse mapea la estructura de chat de OpenAI que usa OpenRouter
type OpenRouterResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// OpenRouterModelsResponse representa la respuesta del endpoint de modelos de OpenRouter
type OpenRouterModelsResponse struct {
	Data []OllamaModel `json:"data"`
}

const openRouterChatURL = "https://openrouter.ai/api/v1/chat/completions"
const openRouterModelsURL = "https://openrouter.ai/api/v1/models"

var apiKeyOpenrouterStorage string = "open_router_apikey"

func (f *IAOpenRouter) SetApiKeyOpenRouter(apiKey string) {
	storage.NewSecureStorageService().SaveSecret(apiKeyOpenrouterStorage, apiKey)
}

// Auxiliar para inyectar las cabeceras requeridas por OpenRouter
func (f *IAOpenRouter) doRequest(method, url string, body io.Reader) (*http.Response, error) {
	req, err := http.NewRequestWithContext(f.ctx, method, url, body)
	if err != nil {
		return nil, err
	}

	apiKey, err := storage.NewSecureStorageService().GetSecret(apiKeyOpenrouterStorage)
	if len(apiKey) == 0 {
		return nil, errors.New("no_apikey")
	}
	fmt.Println(apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Opcional pero recomendado por OpenRouter para rankings
	req.Header.Set("HTTP-Referer", "https://tu-app.com")
	req.Header.Set("X-Title", "Snippet Generator")

	client := &http.Client{}
	return client.Do(req)
}

// PreguntarOllama envía la consulta utilizando Structured Outputs con formato OpenAI/OpenRouter
func (f *IAOpenRouter) PreguntarOllama(modelo string, pregunta string) (*SnippetState, error) {
	if f.ctx == nil {
		f.ctx = context.Background()
	}

	payload := map[string]interface{}{
		"model": modelo,
		"messages": []map[string]interface{}{
			{
				"role":    "system",
				"content": "Eres un asistente experto en programación que genera snippets de código estructurados en JSON. Cada línea del snippet debe ser un elemento separado dentro del array 'body'. Quiero este formato con el JSON: { body: string[], scope: string, isFileTemplate: boolean, description: string, prefix: string }",
			},
			{
				"role":    "user",
				"content": pregunta,
			},
		},
		"response_format": map[string]string{
			"type": "json_object",
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("error al serializar el payload: %w", err)
	}

	resp, err := f.doRequest("POST", openRouterChatURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("error al conectar con OpenRouter: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer la respuesta: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("openrouter devolvió un estado de error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var openRouterResp OpenRouterResponse
	if err := json.Unmarshal(bodyBytes, &openRouterResp); err != nil {
		return nil, fmt.Errorf("error al deserializar la respuesta de OpenRouter: %w", err)
	}

	if len(openRouterResp.Choices) == 0 {
		return nil, fmt.Errorf("openrouter no devolvió ninguna respuesta válida (choices vacío)")
	}

	content := openRouterResp.Choices[0].Message.Content

	var snippet SnippetState
	if err := json.Unmarshal([]byte(content), &snippet); err != nil {
		return nil, fmt.Errorf("error al mapear a SnippetState: %w. Contenido: %s", err, content)
	}

	return &snippet, nil
}

// PreguntarVariosOllama envía la consulta para devolver una lista de snippets
func (f *IAOpenRouter) PreguntarVariosOllama(modelo string, pregunta string) ([]SnippetState, error) {
	if f.ctx == nil {
		f.ctx = context.Background()
	}
	/*
		jsonSchema := map[string]interface{}{
			"type": "json_schema",
			"json_schema": map[string]interface{}{
				"name":   "snippets_list_schema",
				"strict": true,
				"schema": map[string]interface{}{
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
										"type":  "array",
										"items": map[string]string{"type": "string"},
									},
									"isFileTemplate": map[string]string{"type": "boolean"},
								},
								"required":             []string{"prefix", "description", "scope", "body", "isFileTemplate"},
								"additionalProperties": false,
							},
						},
					},
					"required":             []string{"snippets"},
					"additionalProperties": false,
				},
			},
		}*/

	payload := map[string]interface{}{
		"model": modelo,
		"messages": []map[string]interface{}{
			{
				"role":    "system",
				"content": "Eres un asistente experto en programación que genera listas de snippets de código estructurados en JSON. Genera tantos snippets como tenga sentido para la petición. Cada línea del snippet debe ser un elemento separado dentro del array 'body'. Quiero este formato con el JSON: { body: string[], scope: string, isFileTemplate: boolean, description: string, prefix: string }",
			},
			{
				"role":    "user",
				"content": pregunta,
			},
		},
		"response_format": map[string]string{
			"type": "json_object",
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("error al serializar el payload: %w", err)
	}

	resp, err := f.doRequest("POST", openRouterChatURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("error al conectar con OpenRouter: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer la respuesta: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("openrouter devolvió un estado de error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var openRouterResp OpenRouterResponse
	if err := json.Unmarshal(bodyBytes, &openRouterResp); err != nil {
		return nil, fmt.Errorf("error al deserializar la respuesta de OpenRouter: %w", err)
	}

	if len(openRouterResp.Choices) == 0 {
		return nil, fmt.Errorf("openrouter no devolvió ninguna respuesta válida (choices vacío)")
	}

	content := openRouterResp.Choices[0].Message.Content

	var wrapper struct {
		Snippets []SnippetState `json:"snippets"`
	}

	if err := json.Unmarshal([]byte(content), &wrapper); err != nil {
		return nil, fmt.Errorf("error al mapear a lista de SnippetState: %w. Contenido: %s", err, content)
	}

	return wrapper.Snippets, nil
}

// ListarModelosOllama obtiene los modelos disponibles globales en OpenRouter
func (f *IAOpenRouter) ListarModelosOllama() ([]OllamaModel, error) {
	if f.ctx == nil {
		f.ctx = context.Background()
	}

	resp, err := f.doRequest("GET", openRouterModelsURL, nil)
	if err != nil {
		return nil, fmt.Errorf("error al conectar con OpenRouter para listar modelos: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer los modelos de OpenRouter: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("openrouter devolvió un estado de error al listar modelos (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	// Estructura intermedia nativa de OpenRouter
	var rawModels struct {
		Data []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"data"`
	}

	if err := json.Unmarshal(bodyBytes, &rawModels); err != nil {
		return nil, fmt.Errorf("error al deserializar los modelos de OpenRouter: %w", err)
	}

	// Mapeamos los datos al tipo exacto OllamaModel que espera tu frontend/UI externa
	var modelos []OllamaModel
	for _, item := range rawModels.Data {
		modelos = append(modelos, OllamaModel{
			Name:  item.Name, // Nombre legible ("Meta: Llama 3 8B")
			Model: item.ID,   // Identificador de la API ("meta-llama/llama-3-8b-instruct")
		})
	}

	return modelos, nil
}
