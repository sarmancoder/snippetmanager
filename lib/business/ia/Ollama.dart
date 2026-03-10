import 'package:aisnippets/business/ia/index.dart';
import 'package:ollama_dart/ollama_dart.dart';


class AiAgentOllama extends AiAgent {
  static final client = OllamaClient();
  AiAgentOllama({required super.modelName});

  @override
  Future<String> ask(List<String> instructions, String prompt, int tries) async {
    print("Usando modelo de ollama " + this.modelName);
    if (tries < numMaxTries) {
      print("Intento numero ${numMaxTries - tries}/$numMaxTries");
    }

    final generated = await client.generateChatCompletion(
      request: GenerateChatCompletionRequest(
        model: modelName,
        messages: [
          for (var i = 0; i< instructions.length; i++)
            Message(content: instructions[i], role: MessageRole.user),
          // Message(role: MessageRole.user, content: prompt)
        ]
      )
    );

    print("generado");

    if (generated.message.content.isEmpty) {
      return await ask(instructions, prompt, tries - 1);
    }

    return generated.message.content;
  }

  static Future<ModelsResponse> getModels () async {
    return await client.listModels();
  }

}

/*
void main() async {
  var aiAgent = AiAgentOllama(modelName: "gpt-oss:20b");

  var response = await aiAgent.prompt(AskMode.create, "Quiero un snippet de vfor de vue en json para usar en vscode");
  print(response);
}
*/