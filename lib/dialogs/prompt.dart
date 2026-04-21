import 'dart:async' show Completer;
import 'package:flutter/material.dart';


Future<String> prompt({required BuildContext context, required String title}) {
  var comp = Completer<String>();

  showDialog(
    context: context,
    builder: (c) {
      return _PromptAlertDialog(title: title, callback: (res) {
        comp.complete(res);
      });
    },
  );

  return comp.future;
}

class _PromptAlertDialog extends StatefulWidget {
  final String title;
  final Function(String response) callback;

  const _PromptAlertDialog({super.key, required this.title, required this.callback});

  @override
  State<_PromptAlertDialog> createState() => _PromptAlertDialogState();
}

class _PromptAlertDialogState extends State<_PromptAlertDialog> {
  var controller = TextEditingController();
  var msg = "";

  @override
  void dispose() {
    // TODO: implement dispose
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (msg.isNotEmpty) Text(msg),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: controller,
                  decoration: const InputDecoration(
                    labelText: 'Rellena tu respuesta aquí',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.person),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter some text';
                    }
                    return null;
                  }
                ),
              ),
            ],
          )
        ],
      ),
      actions: [
        FilledButton.icon(
          icon: Icon(Icons.check),
          onPressed: () {
            if (controller.text.isEmpty) {
              setState(() {
                msg = "No puede estar vacío";
              });
              return;
            }
            widget.callback(controller.text);
          }, label: Text("Proceder"))
      ],
    );
  }
}
