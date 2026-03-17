import 'dart:convert';

import 'package:aisnippets/business/ia/Ollama.dart';
import 'package:aisnippets/business/ia/index.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:dart_openai/dart_openai.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MyPopupContent extends ConsumerStatefulWidget {
  final bool online;
  const MyPopupContent({super.key, required this.online});

  @override
  ConsumerState<MyPopupContent> createState() => _MyPopupContentState();
}

var defaultText = "En vue un vfor";

class _MyPopupContentState extends ConsumerState<MyPopupContent> {
  bool unable = false;
  bool online = false;
  AskMode askMode = AskMode.create;
  dynamic backSnippet;
  final ScrollController _myScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    online = widget.online;
    var promptToIa = getMessagesFor(askMode, defaultText, null);
    controllerPrompt.value = TextEditingValue(text: promptToIa.join('\n'));
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _myScrollController.animateTo(
        _myScrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  TextEditingController controller = TextEditingController(text: defaultText);
  TextEditingController controllerPrompt = TextEditingController();

  @override
  Widget build(BuildContext context) {
    SharedPreferences sp = ref.watch(sharedPrefsProvider);
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize:
            MainAxisSize.min, // Importante para que no ocupe toda la pantalla
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                "Modificar snippet con IA",
                style: Theme.of(
                  context,
                ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              SegmentedButton<bool>(
                onSelectionChanged: (p0) {
                  setState(() {
                    sp.setBool(SharedPrefsValues.iaOnline, p0.first);
                    online = p0.first;
                  });
                },
                segments: [
                  ButtonSegment(value: false, label: Text("Ollama")),
                  ButtonSegment(value: true, label: Text("OpenRouter")),
                ],
                selected: {online},
              ),
            ],
          ),
          const SizedBox(height: 10),
          Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Transform.scale(
                  scale: 0.8,
                  child: SegmentedButton<AskMode>(
                    style: ButtonStyle(visualDensity: VisualDensity.compact),
                    onSelectionChanged: (p0) {
                      setState(() {
                        askMode = p0.first;
                      });
                    },
                    segments: [
                      ButtonSegment(
                        value: AskMode.modify,
                        label: Text("Modificar"),
                      ),
                      ButtonSegment(
                        value: AskMode.create,
                        label: Text("Reemplazar"),
                      ),
                    ],
                    selected: {askMode},
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: TextField(
              maxLines: 12,
              readOnly: true,
              scrollController: _myScrollController,
              controller: controllerPrompt,
              decoration: InputDecoration(filled: true),
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: (value) {
                var activeSnippet = ref
                    .read(activeSnippetProvider.notifier)
                    .getCurrent();
                var snippet = askMode == AskMode.modify ? activeSnippet : null;
                var promptToIa = getMessagesFor(askMode, value, snippet);
                controllerPrompt.value = TextEditingValue(
                  text: promptToIa.join('\n'),
                );
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  _myScrollController.animateTo(
                    _myScrollController.position.maxScrollExtent,
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeOut,
                  );
                });
              },
              maxLines: 2, // Esto lo convierte en un TextArea
              decoration: InputDecoration(
                hintText: "Escribe algo aquí...",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              IconButton(
                onPressed: (backSnippet == null || unable)
                    ? null
                    : () {
                        undo();
                      },
                icon: Icon(Icons.undo),
              ),
              Expanded(child: Container()),
              TextButton(
                onPressed: unable
                    ? null
                    : () async {
                        await runTask(() async {
                          await promptToIa();
                        });
                      }, // Cierra el popup
                child: const Text("Proceder"),
              ),
              /*ElevatedButton(
                onPressed: unable
                    ? null
                    : () async {
                        await runTask(() async {
                          await promptToIa(AskMode.create);
                        });
                      },
                child: const Text("Reemplazar"),
              ),*/
            ],
          ),
        ],
      ),
    );
  }

  undo() {
    ref.read(activeSnippetProvider.notifier).setActiveSnippet(backSnippet);
  }

  promptToIa() async {
    if (online) {
      var sstorage = FlutterSecureStorage();
      var apiKey = await sstorage.read(key: SharedPrefsValues.apiKeyOpenRouter);
      if (apiKey == null || apiKey.isEmpty) {
        await alert(context: context, content: Text("Es necesario poner la api key"));
        return;
      }
    }
    var activeSnippet = ref.read(activeSnippetProvider.notifier).getCurrent();
    if (activeSnippet != null) {
      setState(() {
        backSnippet = activeSnippet;
      });
    }
    if (activeSnippet == null) return;
    var model = ref
        .read(sharedPrefsProvider)
        .getString(online ? SharedPrefsValues.openRouterModel : SharedPrefsValues.ollamaModel);
    var agent = AiAgent.getInstance(modelName: model, online: online);
    print("preguntando a ${online ? "Open router" : "Ollama"}");
    try {
      var snippet = await agent.prompt(
        askMode,
        controller.text,
        askMode == AskMode.modify ? activeSnippet : null,
      );
      var jsonAiSnippet = jsonDecode(snippet);
      ref
          .read(activeSnippetProvider.notifier)
          .setActiveSnippet(
            Snippet(
              prefix: jsonAiSnippet["prefix"],
              description: jsonAiSnippet["description"],
              body: jsonAiSnippet["body"].join("\n"),
              key: activeSnippet.key,
              scope: jsonAiSnippet["scope"] ?? "",
            ),
          );
    } on RequestFailedException catch (e) {
      await alert(context: context, content: Text(e.message));
    } catch (exception) {
      print("No se pudo establecer el snippet");
    }
  }

  Future<void> runTask(cb) async {
    try {
      setState(() {
        unable = true;
      });
      await cb();
      setState(() {
        unable = false;
      });
    } catch (e) {
      print(e.toString());
      setState(() {
        unable = false;
      });
    }
  }
}
