import 'dart:convert';

import 'package:aisnippets/business/ia/Ollama.dart';
import 'package:aisnippets/business/ia/OpenRouter.dart';
import 'package:aisnippets/business/models/AiSnippetsMessage.dart';
import 'package:aisnippets/business/models/Snippet.dart';

var instructionsTXT = """
Hola, eres un asistente y me vas a responder solamente con un json con esta estructura, no necesito markdown:
{
  prefix: string
  description: string
  scope: string
  body: string[]
}
""";

var instConvert = """
Hola, eres un asistente, y quiero que me respondas un json que tenga la siguiente estructura
type SnippetsConfig = {
  [key: string]: {
    prefix: string;
    description: string;
    body: string[];
    scope?: string;
  };
};
Los prefixes quiero que sean los mismos, no os cambies
""";

var convertPromptTxt = """
Te voy a pasar un listado de snippets y quiero que hagas las siguientes modificaciones, entonces de vuelta quiero todos los snippets pero con las modificaciones que dije
""";

var instructionsTXTModify = (snippet) => """
Actualmente el snippet que tengo es este:
$snippet

Quiero que hagas cambios
""";

enum AskMode {create, modify, convert}

final numMaxTries = 5;

getMessagesFor(AskMode mode, String prompt, Snippet? currentSnippet) {
    List<AiSnippetsMessage> messages = [
      AiSnippetsMessage(text: mode == AskMode.convert ? instConvert : instructionsTXT, type: MessageType.System)
    ];

    if (mode == AskMode.modify && currentSnippet != null) {
      var snippetJson = {
        "prefix": currentSnippet.prefix,
        "description": currentSnippet.description,
        "body": currentSnippet.body,
        "scope": currentSnippet.scope
      };
      messages.add(
        AiSnippetsMessage(
          text: "Mi actual snippet es el siguiente: ${jsonEncode(snippetJson)}. Quiero que me lo modifiques para: ",
          type: MessageType.User)
      );
      messages.add(
        AiSnippetsMessage(
          text: prompt,
          type: MessageType.User)
      );
    } if (mode == AskMode.convert) {
      messages.add(
        AiSnippetsMessage(text: convertPromptTxt, type: MessageType.User)
      );
      messages.add(
        AiSnippetsMessage(text: prompt, type: MessageType.User)
      );
    } else {
      messages.add(
        AiSnippetsMessage(
          text: prompt,
          type: MessageType.User)
      );
    }

    return messages;
}

abstract class AiAgent {
  final String modelName;

  AiAgent({required this.modelName});

  static AiAgent getInstance ({String? modelName, required bool online}) {
    if (online) {
      return OpenRouterAgent(modelName: modelName ?? "openrouter/auto:free" );
    }
    if (modelName == null) {
      throw 'Obligatorio para ollama seleccionar un modelo';
    }
    return AiAgentOllama(modelName: modelName);
  }

  Future<String> prompt(AskMode mode, String prompt, Snippet? currentSnippet) async {
    List<AiSnippetsMessage> messages = getMessagesFor(mode, prompt, currentSnippet);

    return await ask(messages, prompt, numMaxTries);
  }

  Future<String> ask(List<AiSnippetsMessage> messages, String prompt, int tries);
}