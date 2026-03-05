import 'package:aisnippets/business/ia/index.dart';
import 'package:dart_openai/dart_openai.dart';

const apiKey =
    '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';

class OpenRouterAgent extends AiAgent {
  OpenRouterAgent({required super.modelName});

  @override
  Future<String> ask(List<String> messages, String prompt, int tries) async {
    if (tries < numMaxTries) {
      print("Intento numero ${numMaxTries - tries}/$numMaxTries");
    }

    OpenAI.apiKey = apiKey;
    OpenAI.baseUrl = "https://openrouter.ai/api";

    var messagesOpenAi = [
      for (var i = 0; i < messages.length; i++)
        OpenAIChatCompletionChoiceMessageContentItemModel.text(messages[i]),
      OpenAIChatCompletionChoiceMessageContentItemModel.text(prompt),
    ];

    OpenAIChatCompletionModel comp = await OpenAI.instance.chat.create(
      model:
          "openai/gpt-5-nano", // Eliges el modelo que quieras de OpenRouter
      messages: [
        OpenAIChatCompletionChoiceMessageModel(
          content: messagesOpenAi,
          role: OpenAIChatMessageRole.user,
        ),
      ],
    );

    var response = comp.choices.first.message.content;
    print(response?[0].text!);
    if (response == null || response.isEmpty) {
      return await ask(messages, prompt, tries - 1);
    }
    return response[0].text!;
  }
}
