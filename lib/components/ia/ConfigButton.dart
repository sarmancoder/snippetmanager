import 'package:aisnippets/dialogs/ConfigDialog.dart';
import 'package:flutter/material.dart';

class ConfigButton extends StatelessWidget {
  const ConfigButton({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(Icons.settings),
      onPressed: () {
        showDialog(context: context, builder: (c) {
          return ConfigDialog();
        });
      },
      tooltip: 'Configuración',
    );
  }
}