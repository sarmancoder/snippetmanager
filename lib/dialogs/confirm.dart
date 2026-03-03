import 'dart:async';

import 'package:flutter/material.dart';

Future<bool> confirm({required BuildContext context, required Widget content}) {
  var comp = Completer<bool>();

  showDialog(
    context: context,
    builder: (c) {
      return AlertDialog(
        title: const Text('Atención'),
        content: content,
        actions: [
          ElevatedButton(
            child: const Text('Confirmar'),
            onPressed: () {
              comp.complete(true);
              Navigator.of(context).pop();
            },
          ),
          ElevatedButton(
            child: const Text('Volver'),
            onPressed: () {
              comp.complete(false);
              Navigator.of(context).pop();
            },
          ),
        ],
      );
    },
  );

  return comp.future;
}
