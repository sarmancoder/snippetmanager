import 'dart:async';

import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/directory_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

Future<String> promptSnippetFile(BuildContext context) async {
  var comp = Completer<String>();

  showDialog(
    context: context,
    useSafeArea: true,
    barrierDismissible: false,
    builder: (context) {
      return Movesnippettofile(
        onSelect: (String fileName) {
          comp.complete(fileName);
        }
      );
    },
  );

  return comp.future;
}

class Movesnippettofile extends ConsumerStatefulWidget {
  final Function(String fileName) onSelect;
  const Movesnippettofile({super.key, required this.onSelect});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _MovesnippettofileState();
}

class _MovesnippettofileState extends ConsumerState<Movesnippettofile> {
  TextEditingController controller = TextEditingController();
  int selectedFile = 0;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var files = ref.watch(
      directoryProviderProvider.select((val) => val.value?.files ?? []),
    );
    return AlertDialog(
      title: Text('Mover archivo'),
      content: SizedBox(
        width: 450,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 10,
          children: [
            RadioGroup<int>(
              groupValue: selectedFile,
              onChanged: (val) {
                selectedFile = val!;
                setState(() {
                  
                });
              },
              child: ListView.separated(
                itemCount: files.length + 1,
                shrinkWrap: true,
                separatorBuilder: (context, index) => const SizedBox(height: 10),
                itemBuilder: (BuildContext context, int index) {
                  if (index > files.length - 1) {
                    return RadioListTile(
                      value: index,
                      title: TextFormField(
                        controller: controller,
                        decoration: const InputDecoration(
                          isDense: true,
                          labelText: 'Nuevo nombre del archivo',
                          // border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter some text';
                          }
                          return null;
                        },
                        onTap: () {
                          selectedFile = index;
                          setState(() {});
                        },
                        onFieldSubmitted: (value) {
                          if (value.isEmpty) {
                            return;
                          }
                          widget.onSelect("$value.code-snippets");
                        },
                      )
                    );
                  }
                  var file = files[index];
                  return RadioListTile(
                    value: index,
                    title: Text(file.name.replaceAll(".$snippetFileExtension", "")));
                },
              ),
            ),
            ElevatedButton(
              child: const Text('Seleccionar archivo'),
              onPressed: () {
                widget.onSelect(files[selectedFile].name);
              },
            )
          ],
        ),
      ),
    );
  }
}
