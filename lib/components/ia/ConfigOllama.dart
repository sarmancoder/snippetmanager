import 'package:aisnippets/business/ia/Ollama.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/dialogs/ConfigDialog.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ollama_dart/ollama_dart.dart';

class ConfigOllama extends StatefulWidget {
  const ConfigOllama({super.key});

  @override
  State<ConfigOllama> createState() => _ConfigOllamaState();
}

class _ConfigOllamaState extends State<ConfigOllama> {
  // 1. Declaramos la variable del Future
  late Future<ModelsResponse> _modelsFuture;

  @override
  void initState() {
    super.initState();
    // 2. Lo inicializamos AQUÍ. Solo se ejecutará una vez en la vida del widget.
    _modelsFuture = AiAgentOllama.getModels();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ModelsResponse>(
      future: _modelsFuture, // 3. Usamos la referencia guardada
      builder: (BuildContext context, AsyncSnapshot<ModelsResponse> snapshot) {
        if (snapshot.hasError) return Text(snapshot.error.toString());
        
        if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
          return ConfigOllamaEditor(models: snapshot.data!);
        }
        
        return const Center(child: Text("Cargando..."));
      },
    );
  }
}

class ConfigOllamaEditor extends ConsumerStatefulWidget {
  final ModelsResponse models;

  const ConfigOllamaEditor({super.key, required this.models});

  @override
  ConsumerState<ConfigOllamaEditor> createState() => _ConfigOllamaEditorState();
}

class _ConfigOllamaEditorState extends ConsumerState<ConfigOllamaEditor> {
  TextEditingController controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    var model = ref.read(sharedPrefsProvider).getString(SharedPrefsValues.ollamaModel);
    controller.value = TextEditingValue(text: model ?? "");
  }

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
        Autocomplete<String>(
          initialValue: TextEditingValue(text: controller.text),
          optionsBuilder: (TextEditingValue textEditingValue) {
            List<Model> models = widget.models.models ?? [];
            var _options = models.map((m) => m.model!);

            if (textEditingValue.text == '') {
              return _options;
            }
            
            return _options.where((String option) {
              return option.contains(textEditingValue.text.toLowerCase());
            });
          },
          onSelected: (String selection) {
            controller.text = selection; // Actualizamos tu controlador
            setSaved(false);
          },
          // Para usar TU TextField personalizado:
          fieldViewBuilder:
              (context, textEditingController, focusNode, onFieldSubmitted) {
                // Sincronizamos los controladores si es necesario o usamos el que nos da el widget
                return TextField(
                  controller: textEditingController,
                  focusNode: focusNode,
                  onChanged: (value) {
                    setSaved(false);
                  },
                  decoration: InputDecoration(
                    label: const Text('Modelo a usar'),
                  ),
                );
              },
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          child: const Text('Guardar'),
          onPressed: () {
            ref.read(sharedPrefsProvider).setString(SharedPrefsValues.ollamaModel, controller.text);
            setSaved(true);
          },
        ),
      ],
    );
  }
}
