import 'package:aisnippets/dialogs/ConfigDialog.dart';
import 'package:flutter/material.dart';

class ConfigOllama extends StatefulWidget {
  const ConfigOllama({super.key});

  @override
  State<ConfigOllama> createState() => _ConfigOllamaState();
}

class _ConfigOllamaState extends State<ConfigOllama> {
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
          controller: controller,
          onChanged: (value) => setSaved(false),
          decoration: InputDecoration(label: const Text('Modelo a usar')),
        ),
        const SizedBox(height: 20),
        ElevatedButton(child: const Text('Guardar'), onPressed: () {
          setSaved(true);
        }),
      ],
    );
  }
}
