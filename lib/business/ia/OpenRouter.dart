import 'dart:async';

import 'package:aisnippets/business/ia/index.dart';
import 'package:aisnippets/business/models/AiSnippetsMessage.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:dart_openai/dart_openai.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

// const apiKey = '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';

class OpenRouterAgent extends AiAgent {
  OpenRouterAgent({super.modelName = "openrouter/auto:free"});

  static Future<List<String>> getAvailableModels() async {
    try {
      var sstorage = FlutterSecureStorage();
      var apiKey = await sstorage.read(key: SharedPrefsValues.apiKeyOpenRouter);

      if (apiKey == null) {
        return [];
      }

      final response = await http.get(
        Uri.parse("https://openrouter.ai/api/v1/models"),
        headers: {
          "Authorization": "Bearer $apiKey",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final List models = data['data'];

        // Retornamos solo los IDs de los modelos (ej: google/gemini-pro)
        return models.map((m) => m['id'].toString()).toList();
      } else {
        throw Exception("Error al cargar modelos: ${response.statusCode}");
      }
    } catch (e) {
      print("Error manual: $e");
      return [];
    }
  }

  @override
  Future<String> ask(
    List<AiSnippetsMessage> messages,
    String prompt,
    int tries,
  ) async {
    try {
      print("Intento numero ${numMaxTries - tries}/$numMaxTries");

      var sstorage = FlutterSecureStorage();
      var apiKey = await sstorage.read(key: SharedPrefsValues.apiKeyOpenRouter);

      OpenAI.apiKey = apiKey!;
      OpenAI.baseUrl = "https://openrouter.ai/api";

      print(messages.toString());

      List<OpenAIChatCompletionChoiceMessageModel> messagesOpenAi = messages
          .map((m) {
            return OpenAIChatCompletionChoiceMessageModel(
              role: m.type == MessageType.User
                  ? OpenAIChatMessageRole.user
                  : OpenAIChatMessageRole.assistant,
              content: [
                OpenAIChatCompletionChoiceMessageContentItemModel.text(m.text),
              ],
            );
          })
          .toList();

      OpenAIChatCompletionModel comp = await OpenAI.instance.chat.create(
        model: modelName,
        responseFormat: {"type": "json_object"},
        messages: messagesOpenAi, // Aquí pasas la lista completa ya formateada
      );

      var response = comp.choices.first.message.content?[0].text;
      if (response == null || response.isEmpty) {
        if (tries > 0) {
          return await ask(messages, prompt, tries - 1);
        }
        throw 'Demasiados intentos';
      }
      return response;
    } on TimeoutException catch (e) {
      print('timeout!');
      if (tries > 0) {
        return await ask(messages, prompt, tries - 1);
      }
      throw 'Demasiados intentos';
    } catch (exception) {
      print(StackTrace.current);
      throw exception;
    }
  }
}
