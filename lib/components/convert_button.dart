import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/providers/services.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConvertButton extends ConsumerWidget {
  const ConvertButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var saved = ref.read(savedProvider);
    return IconButton(
      icon: Icon(Icons.replay_outlined),
      onPressed: () async {
        if (!saved) {
          var save = await confirm(
            context: context,
            content: Text("¿Salvar los cambios?"),
          );
          if (!save) return;
          await ref.read(servicesProvider.notifier).saveCurrentSnippet();
        }
        showDialog(
          context: context,
          builder: (c) {
            return ConvertDialog();
          },
        );
      },
      tooltip: 'Convertir snippet file',
    );
  }
}

class ConvertDialog extends StatefulWidget {
  const ConvertDialog({super.key});

  @override
  State<ConvertDialog> createState() => _ConvertDialogState();
}

class _ConvertDialogState extends State<ConvertDialog> {
  var currentContentController = TextEditingController();
  var modificationsController = TextEditingController();
  var convertedContentController = TextEditingController();
  var filenameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Modificar snippet'),
      content: SizedBox(
        width:
            MediaQuery.of(context).size.width *
            0.8, // Ancho relativo para que quepan 2 columnas
        child: IntrinsicHeight(
          child: Row(
            spacing: 10,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // COLUMNA IZQUIERDA (Tus dos inputs originales)
              Expanded(
                flex: 1,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      maxLines: 7,
                      controller: currentContentController,
                      decoration: const InputDecoration(
                        labelText: 'Snippet original',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(
                      height: 16,
                    ), // Espacio entre los dos de la izquierda
                    TextField(
                      maxLines: 4,
                      controller: modificationsController,
                      decoration: const InputDecoration(
                        labelText: 'Instrucciones de cambio',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
              VerticalDivider(color: Colors.black.withAlpha(75)),
              Expanded(
                flex: 1,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  spacing: 10,
                  children: [
                    TextField(
                      controller: filenameController,
                      decoration: const InputDecoration(
                        labelText: 'Nombre del archivo',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) {
                        // TODO: Handle text change
                      },
                    ),
                    TextField(
                      controller: convertedContentController, // Sustituye por tu controlador
                      maxLines: 10, // Esto lo hace "grande" visualmente
                      decoration: const InputDecoration(
                        labelText: 'Resultado / Vista previa',
                        alignLabelWithHint: true, // Para que el label salga arriba
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        ElevatedButton(
          child: const Text('Modificar snippet'),
          onPressed: () {},
        ),
      ],
    );
  }
}
