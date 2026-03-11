import 'package:aisnippets/business/ia/OpenRouter.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/dialogs/ConfigDialog.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class OpenRouterInfo {
  final String apiKey;
  final List<String> models;

  OpenRouterInfo({required this.apiKey, required this.models});
}

class ConfigOpenRouter extends StatefulWidget {
  const ConfigOpenRouter({super.key});

  @override
  State<ConfigOpenRouter> createState() => _ConfigOpenRouterState();
}

class _ConfigOpenRouterState extends State<ConfigOpenRouter> {
  late Future<OpenRouterInfo> _modelsFuture;

  @override
  void initState() {
    super.initState();
    _modelsFuture = getOpenRouterData();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<OpenRouterInfo>(
      future: _modelsFuture,
      builder: (BuildContext context, AsyncSnapshot<OpenRouterInfo> snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          print(snapshot.stackTrace);
          return Text('Error ${snapshot.error}');
        } else if (snapshot.hasData) {
          return ConfigOpenRouterPanel(info: snapshot.data!);
        } else {
          return const Text('No data');
        }
      },
    );
  }

  Future<OpenRouterInfo> getOpenRouterData() async {
    var sstorage = FlutterSecureStorage();
    var apiKey = await sstorage.read(key: SharedPrefsValues.apiKeyOpenRouter);
    var models = await OpenRouterAgent.getAvailableModels();
    return OpenRouterInfo(apiKey: apiKey ?? "", models: models);
  }
}

class ConfigOpenRouterPanel extends ConsumerStatefulWidget {
  late List<String> models;
  late String apiKey;

  ConfigOpenRouterPanel({super.key, required OpenRouterInfo info}) {
    models = info.models;
    apiKey = info.apiKey;
  }

  @override
  ConsumerState<ConfigOpenRouterPanel> createState() =>
      _ConfigOpenRouterPanelState();
}

class _ConfigOpenRouterPanelState extends ConsumerState<ConfigOpenRouterPanel> {
  TextEditingController apiKeyController = TextEditingController();
  TextEditingController controller = TextEditingController();
  bool _isObscured = true;

  @override
  void initState() {
    super.initState();
    var currentModel =
        ref
            .read(sharedPrefsProvider)
            .getString(SharedPrefsValues.openRouterModel) ??
        "";
    controller.value = TextEditingValue(text: currentModel);
    apiKeyController.value = TextEditingValue(text: widget.apiKey);
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
        TextField(
          controller: apiKeyController,
          onChanged: (value) async {
            if (value.isEmpty) return;

            var sstorage = FlutterSecureStorage();
            await sstorage.write(
              key: SharedPrefsValues.apiKeyOpenRouter,
              value: value,
            );

            var models = await OpenRouterAgent.getAvailableModels();
            print("Models ${models.length}");
            widget.models = models;
            setSaved(false);
          },
          obscureText: _isObscured,
          decoration: InputDecoration(
            suffixIcon: IconButton(
              icon: Icon(_isObscured ? Icons.visibility : Icons.visibility_off, color: Colors.black),
              onPressed: () {
                setState(() {
                  _isObscured =
                      !_isObscured; // Cambiamos el estado al hacer click
                });
              },
            ),
            label: const Text('Api key'),
          ),
        ),
        Autocomplete<String>(
          initialValue: TextEditingValue(text: controller.text),
          optionsBuilder: (TextEditingValue textEditingValue) {
            List<String> models = widget.models;
            var _options = models.map((m) => m);

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
            final storage = FlutterSecureStorage();
            storage.write(
              key: SharedPrefsValues.apiKeyOpenRouter,
              value: apiKeyController.text,
            );
            ref
                .read(sharedPrefsProvider)
                .setString(SharedPrefsValues.openRouterModel, controller.text);
            setSaved(true);
          },
        ),
      ],
    );
  }
}
