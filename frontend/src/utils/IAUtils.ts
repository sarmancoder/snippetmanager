import * as ollama from '../../wailsjs/go/ia/IAOllama'
import {ia} from '../../wailsjs/go/models'
import * as openrouter from '../../wailsjs/go/ia/IAOpenRouter'

type IAInterface = {
    preguntar: (modelo: string, pregunta: string) => Promise<ia.SnippetState>,
    listarModelos: () => Promise<ia.OllamaModel[]>,
    preguntarVarios: (modelo: string, pregunta: string) => Promise<ia.SnippetState[]>
}

const IAS: Record<string, IAInterface> = {
    ollama: {
        preguntar: ollama.PreguntarOllama,
        listarModelos: ollama.ListarModelosOllama,
        preguntarVarios: ollama.PreguntarVariosOllama,
    },
    openRouter: {
        preguntar: openrouter.PreguntarOllama,
        listarModelos: openrouter.ListarModelosOllama,
        preguntarVarios: openrouter.PreguntarVariosOllama,
    },
}

export type IAEnum = keyof typeof IAS

export default class IAService {
    public ia: IAInterface;

    constructor(model: IAEnum) {
        this.ia = IAS[model]
    }
}
