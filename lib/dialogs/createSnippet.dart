import 'dart:async';

import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

Future<Snippet?> createSnippet({
  required BuildContext context,
}) {
  var comp = Completer<Snippet?>();

  showDialog(
    context: context,
    builder: (c) {
      return SnippetCreator(
        cb: (newSnippet) {
          comp.complete(newSnippet);
        },
      );
    },
  );

  return comp.future;
}

class SnippetCreator extends ConsumerStatefulWidget {
  final Function(Snippet? newSnippet) cb;

  const SnippetCreator({super.key, required this.cb});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _SnippetCreatorState();
}

class _SnippetCreatorState extends ConsumerState<SnippetCreator> {
  String message = "";

  TextEditingController prefixController = TextEditingController();
  TextEditingController descController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
        title: const Text('Crear nuevo snippet'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (message.isNotEmpty)
            Row(
              children: <Widget>[
                Text(message, textAlign: TextAlign.center, style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),)
              ],
            ),
            Row(
              children: <Widget>[
                Expanded(
                  child: TextField(controller: prefixController, decoration: InputDecoration(label: Text("Prefijo")),),
                ),
              ],
            ),
            Row(
              children: <Widget>[
                Expanded(
                  child: TextField(controller: descController, decoration: InputDecoration(label: Text("Descripción")),),
                ),
              ],
            )
          ],
        ),
        actions: [
          ElevatedButton(
            child: const Text('Volver'),
            onPressed: () {
              widget.cb(null);
              // Navigator.of(context).pop();
            },
          ),
          ElevatedButton(
            child: const Text('Confirmar'),
            onPressed: () {
              setState(() {
                message = "";
              });
              var snippet = Snippet(
                prefix: prefixController.text,
                description: descController.text,
                body: "",
                key: '${prefixController.text}-${getUid()}'
              );
              if (snippet.prefix.isEmpty){
                setState(() {
                  message = "El prefix es obligatorio";
                });
                return;
              }
              widget.cb(snippet);
              // Navigator.of(context).pop();
            },
          ),
        ],
      );
  }
}
