import 'package:aisnippets/components/ia/ConfigOllama.dart';
import 'package:aisnippets/components/ia/ConfigOpenRouter.dart';
import 'package:flutter/material.dart';

class ConfigState extends InheritedWidget {
  bool saved;
  final Function() onPendingSavedData;
  final Function() onSaved;

  ConfigState({
    this.saved = false,
    required this.onPendingSavedData,
    required this.onSaved,
    required Widget child,
  }) : super(child: child);

  setSaved(bool saved) {
    if (saved) onSaved();
    else onPendingSavedData();
    this.saved = saved;
  }

  @override
  bool updateShouldNotify(covariant ConfigState oldWidget) {
    // TODO: implement updateShouldNotify
    return oldWidget.saved != saved;
  }
}

class ConfigDialog extends StatelessWidget {
  const ConfigDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text("Configuración"),
          IconButton(
            icon: Icon(Icons.close, color: Theme.of(context).primaryColor),
            onPressed: () {
              Navigator.of(context).pop();
            },
            tooltip: 'Cerrar',
          ),
        ],
      ),
      content: SizedBox(width: 500, child: ConfigDialogContent()),
    );
  }
}

class ConfigDialogContent extends StatefulWidget {
  const ConfigDialogContent({super.key});

  @override
  State<ConfigDialogContent> createState() => _ConfigDialogContentState();
}

class _ConfigDialogContentState extends State<ConfigDialogContent> {
  bool online = false;
  bool unable = false;

  @override
  Widget build(BuildContext context) {
    return ConfigState(
      onPendingSavedData: () {
        setState(() {
          unable = true;
        });
      },
      onSaved: () {
        setState(() {
          unable = false;
        });
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SegmentedButton<bool>(
            onSelectionChanged: unable ? null : (p0) {
              setState(() {
                online = p0.first;
              });
            },
            segments: [
              ButtonSegment(value: false, label: Text("Ollama")),
              ButtonSegment(value: true, label: Text("Open Router")),
            ],
            selected: {online},
          ),
          SizedBox(height: 20),
          online ? ConfigOpenRouter() : ConfigOllama()
        ],
      ),
    );
  }
}
