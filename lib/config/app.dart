//  https://snippeteditor.vercel.app/app
var host = "localhost:5173"; // "snipppeteditor.vercel.app";

final snippetsWebEditorAddress = "http://$host/app";
final snippetFileExtension = "code-snippets";

abstract final class SharedPrefsValues {
  SharedPrefsValues._();

  static const String lastDirKey = "last_dir_opened";
  static const String darkMode = "is_dark";
  static const String iaOnline = "ia_online";
  static const String ollamaModel = "ollama_model";
  static const String apiKeyOpenRouter = "api_key_open_router";
  static const String openRouterModel = "open_router_model";
}