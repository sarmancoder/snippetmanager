import 'dart:convert';

import 'package:aisnippets/business/ia/Ollama.dart';
import 'package:aisnippets/business/ia/index.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MyPopupContent extends ConsumerStatefulWidget {
  const MyPopupContent({super.key});

  @override
  ConsumerState<MyPopupContent> createState() => _MyPopupContentState();
}

class _MyPopupContentState extends ConsumerState<MyPopupContent> {
  bool unable = false;
  bool online = true;
  TextEditingController controller = TextEditingController(
    text: "En vue un vfor",
  );

  @override
  Widget build(BuildContext context) {
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
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.bold),
              ),
              SegmentedButton<bool>(
                onSelectionChanged: (p0) {
                  setState(() {
                    online = p0.first;
                  });
                },
                segments: [
                  ButtonSegment(value: false, label: Text("Ollama")),
                  ButtonSegment(value: true, label: Text("OpenRouter")),
                ],
                selected: {online}
              )
            ],
          ),
          const SizedBox(height: 10),
          Expanded(
            child: TextField(
              controller: controller,
              maxLines: 6, // Esto lo convierte en un TextArea
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
              TextButton(
                onPressed: unable
                    ? null
                    : () async {
                        await runTask(() async {
                          await promptToIa(AskMode.modify);
                        });
                      }, // Cierra el popup
                child: const Text("Modificar"),
              ),
              ElevatedButton(
                onPressed: unable
                    ? null
                    : () async {
                        await runTask(() async {
                          await promptToIa(AskMode.create);
                        });
                      },
                child: const Text("Reemplazar"),
              ),
            ],
          ),
        ],
      ),
    );
  }

  promptToIa(AskMode askMode) async {
    var activeSnippet = ref.read(activeSnippetProvider.notifier).getCurrent();
    if (activeSnippet == null) return;
    print("preguntando a ollama");
    var agent = AiAgent.getInstance(modelName: "gpt-oss:20b", online: online);
    var snippet = await agent.prompt(askMode, controller.text, askMode == AskMode.modify ? activeSnippet : null);
    try { 
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
    } catch (exception) {
      print(exception.toString());
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
      setState(() {
        unable = false;
      });
    }
  }
}
