import 'dart:convert';

import 'package:aisnippets/business/ia/Ollama.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:ollama_dart/ollama_dart.dart';

var instructionsTXT = """
Hola, eres un asistente y me vas a responder solamente con un json con esta estructura, no necesito markdown:
{
  prefix: string
  description: string
  scope: string
  body: string[]
}
""";

var instructionsTXTModify = (snippet) => """
Actualmente el snippet que tengo es este:
$snippet

Quiero que hagas cambios
""";

enum AskMode {create, modify}

final numMaxTries = 5;

abstract class AiAgent {
  final String modelName;

  AiAgent({required this.modelName});

  static AiAgent getInstance ({required String modelName}) {
    return AiAgentOllama(modelName: modelName);
  }

  Future<String> prompt(AskMode mode, String prompt, Snippet? currentSnippet) async {
    List<Message> messages = [
      Message(
        role: MessageRole.user,
        content: instructionsTXT
      )
    ];

    if (mode == AskMode.modify && currentSnippet != null) {
      var snippetJson = {
        "prefix": currentSnippet.prefix,
        "description": currentSnippet.description,
        "body": currentSnippet.body,
        "scope": currentSnippet.scope
      };
      messages.add(Message(
        role: MessageRole.user,
        content: "Mi actual snippet es el siguiente: ${jsonEncode(snippetJson)}. Quiero que me lo modifiques para: "
      ));
    }

    return await ask(messages, prompt, numMaxTries);
  }

  Future<String> ask(List<Message> messages, String prompt, int tries);
}