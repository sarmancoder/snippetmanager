package ia

type SnippetState struct {
	Prefix         string   `json:"prefix"`
	Description    string   `json:"description"`
	Scope          string   `json:"scope"`
	Body           []string `json:"body"`
	IsFileTemplate bool     `json:"isFileTemplate"`
}

type OllamaModel struct {
	Name       string       `json:"name"`
	Model      string       `json:"model"`
	ModifiedAt string       `json:"modified_at"`
	Size       int64        `json:"size"`
	Digest     string       `json:"digest"`
	Details    ModelDetails `json:"details"`
}

// ModelDetails contiene especificaciones técnicas del modelo
type ModelDetails struct {
	ParentModel       string   `json:"parent_model"`
	Format            string   `json:"format"`
	Family            string   `json:"family"`
	Families          []string `json:"families"`
	ParameterSize     string   `json:"parameter_size"`
	QuantizationLevel string   `json:"quantization_level"`
}
