import 'dart:convert';

import 'package:aisnippets/business/ia/index.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/directory_provider.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AddFileButton extends ConsumerWidget {
  const AddFileButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ElevatedButton(
      child: const Text('Añadir archivo'),
      onPressed: () async {
        var snippets = ref.read(snippetFileProvider);
        if (snippets != null && !snippets.saved) {
          var saved = await ref
              .read(snippetFileProvider.notifier)
              .askForSave(context);
          if (!saved) return;
        }
        showDialog(
          context: context,
          builder: (c) {
            return ConvertDialog(
              getModelName: (bool online) {
                var model = ref
                    .read(sharedPrefsProvider)
                    .getString(
                      online
                          ? SharedPrefsValues.openRouterModel
                          : SharedPrefsValues.ollamaModel,
                    );
                return model;
              },
              createNewFile: (fileName, content) async {
                await ref
                    .read(directoryProviderProvider.notifier)
                    .createNewFile(fileName, content);
                Navigator.of(context).pop();
              },
            );
          },
        );
      },
    );
  }
}

class ConvertDialog extends StatefulWidget {
  final String? Function(bool online) getModelName;
  final Future<void> Function(String fileName, String content) createNewFile;
  const ConvertDialog({
    super.key,
    required this.getModelName,
    required this.createNewFile,
  });

  @override
  State<ConvertDialog> createState() => _ConvertDialogState();
}

class _ConvertDialogState extends State<ConvertDialog> {
  var currentContentController = TextEditingController();
  var modificationsController = TextEditingController();
  var convertedContentController = TextEditingController();
  var filenameController = TextEditingController();
  var fileNameFN = FocusNode();

  bool snippetGenerated = false;
  bool online = false;
  bool unable = false;

  String fileNameNote = "";

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Modificar snippet'),
      content: SizedBox(
        width:
            MediaQuery.of(context).size.width *
            0.8, // Ancho relativo para que quepan 2 columnas
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 10,
          children: [
            IaSelector(
              value: online,
              onChange: (bool newVal) {
                setState(() {
                  online = newVal;
                });
              },
            ),
            IntrinsicHeight(
              child: Row(
                spacing: 10,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // COLUMNA IZQUIERDA (Tus dos inputs originales)
                  Expanded(
                    flex: 1,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextField(
                          maxLines: 7,
                          readOnly: snippetGenerated,
                          controller: currentContentController,
                          decoration: const InputDecoration(
                            labelText: 'Snippet original',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(
                          height: 16,
                        ), // Espacio entre los dos de la izquierda
                        TextField(
                          maxLines: 4,
                          readOnly: snippetGenerated,
                          controller: modificationsController,
                          decoration: const InputDecoration(
                            labelText: 'Instrucciones de cambio',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  VerticalDivider(color: Colors.black.withAlpha(75)),
                  Expanded(
                    flex: 1,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      spacing: 10,
                      children: [
                        TextField(
                          controller: filenameController,
                          focusNode: fileNameFN,
                          enabled: snippetGenerated,
                          readOnly: !snippetGenerated,
                          decoration: const InputDecoration(
                            labelText: 'Nombre del archivo',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (value) {
                            // TODO: Handle text change
                          },
                        ),
                        if (fileNameNote.isNotEmpty)
                          Text(
                            fileNameNote,
                            style: TextStyle(color: Colors.red),
                          ),
                        TextField(
                          controller:
                              convertedContentController, // Sustituye por tu controlador
                          maxLines: 10, // Esto lo hace "grande" visualmente
                          readOnly: true,
                          enabled: snippetGenerated,
                          decoration: const InputDecoration(
                            labelText: 'Resultado / Vista previa',
                            alignLabelWithHint:
                                true, // Para que el label salga arriba
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        if (!snippetGenerated)
          ElevatedButton(
            child: const Text('Modificar snippet'),
            onPressed: unable
                ? null
                : () async {
                    try {
                      setState(() {
                        unable = true;
                      });
                      var modelName = widget.getModelName(online);
                      var instance = AiAgent.getInstance(
                        online: online,
                        modelName: modelName,
                      );
                      var prompt =
                          """
    El snippet:
    ${currentContentController.text}

    La conversión:
    ${modificationsController.text}
    """;
                      var result = await instance.prompt(
                        AskMode.convert,
                        prompt,
                        null,
                      );
                      var snippetList = jsonDecode(result)['SnippetsConfig'];
                      var encoder = JsonEncoder.withIndent(
                        '  ',
                      ).convert(snippetList);
                      convertedContentController.value = TextEditingValue(
                        text: encoder == "null" ? result : encoder,
                      );
                      setState(() {
                        unable = false;
                        snippetGenerated = true;
                      });
                    } catch (exception) {
                      print(exception.toString());
                      setState(() {
                        unable = false;
                      });
                    }
                  },
          )
        else
          ElevatedButton(
            child: const Text('Guardar snippet'),
            onPressed: () async {
              if (filenameController.text.isEmpty) {
                setState(() {
                  fileNameNote = "Es necesario el nombre del archivo";
                });
                fileNameFN.requestFocus();
                return;
              }

              try {
                await widget.createNewFile(
                  filenameController.text,
                  convertedContentController.text,
                );
              } catch (exception) {
                String msg = (exception as dynamic).message;
                if (msg.startsWith("apperror")) {
                  setState(() {
                    fileNameNote = msg.split(":")[1];
                  });
                }
              }
            },
          ),
      ],
    );
  }
}

class IaSelector extends StatelessWidget {
  final bool value;
  final Function(bool value) onChange;

  const IaSelector({super.key, required this.value, required this.onChange});

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<bool>(
      onSelectionChanged: (p0) {
        onChange(p0.first);
      },
      segments: [
        ButtonSegment(value: false, label: Text("Ollama")),
        ButtonSegment(value: true, label: Text("OpenRouter")),
      ],
      selected: {value},
    );
  }
}
