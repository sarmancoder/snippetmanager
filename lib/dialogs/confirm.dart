import 'dart:async';

import 'package:aisnippets/config/theme.dart';
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
            style: ButtonStyle(
              backgroundColor: WidgetStateProperty.resolveWith((state) => buttonColorStyle(state, redColor!))
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              spacing: 5,
              children: [
                Icon(Icons.cancel),
                const Text('Volver'),
              ],
            ),
            onPressed: () {
              comp.complete(false);
              Navigator.of(context).pop();
            },
          ),
          ElevatedButton(
            style: ButtonStyle(
              backgroundColor: WidgetStateProperty.resolveWith((state) => buttonColorStyle(state, greenColor!))
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              spacing: 5,
              children: [
                Icon(Icons.check_circle),
                const Text('Confirmar'),
              ],
            ),
            onPressed: () {
              comp.complete(true);
              Navigator.of(context).pop();
            },
          ),
        ],
      );
    },
  );

  return comp.future;
}


Future<dynamic> alert({required BuildContext context, required Widget content}) {
  var comp = Completer<dynamic>();

  showDialog(
    context: context,
    builder: (c) {
      return AlertDialog(
        title: const Text('Atención'),
        content: content,
        actions: [
          ElevatedButton(
            child: const Text('Ok'),
            onPressed: () {
              comp.complete();
              Navigator.of(context).pop();
            },
          ),
        ],
      );
    },
  );

  return comp.future;
}
