import 'package:aisnippets/dialogs/ConfigDialog.dart';
import 'package:flutter/material.dart';

class ConfigOpenRouter extends StatefulWidget {
  const ConfigOpenRouter({super.key});

  @override
  State<ConfigOpenRouter> createState() => _ConfigOpenRouterState();
}

class _ConfigOpenRouterState extends State<ConfigOpenRouter> {
  TextEditingController apiKeyController = TextEditingController();
  TextEditingController controller = TextEditingController();

  setSaved(bool saved) {
    var config = context.dependOnInheritedWidgetOfExactType<ConfigState>();
    if (config == null) {
      print("No hay state en config");
      return;
    }
    config.setSaved(saved);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: apiKeyController,
          onChanged: (value) => setSaved(false),
          decoration: InputDecoration(label: const Text('Api key')),
        ),
        TextField(
          onChanged: (value) => setSaved(false),
          controller: controller,
          decoration: InputDecoration(label: const Text('Modelo a usar')),
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          child: const Text('Guardar'),
          onPressed: () {
            setSaved(true);
          },
        ),
      ],
    );
  }
}
