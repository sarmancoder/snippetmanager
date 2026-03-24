import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SnippetsDrawer extends ConsumerWidget {
  const SnippetsDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var snippets = ref.watch(snippetFileProvider);

    return Container(
      width: 250,
      color: Colors.white,
      child: Column(
        children: [
          if (snippets != null)
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    for (var i = 0; i < snippets.snippets.length; i++)
                      Builder(
                        builder: (context) {
                          var snippet = snippets.snippets[i];
                          return SnippetTile(
                            key: ValueKey(snippet.key),
                            snippetKey: snippet.key,
                            prefix: snippet.prefix,
                            description: snippet.description,
                            onTap: () async {
                              var active = ref.read(snippetFileProvider);
                              var saved = active!.saved;
                              var activeSnippet = active!.activeSnippet;
                              var targetKey = snippet.key;
                              
                              if (!saved && activeSnippet != null) {
                                var confirmed = await confirm(
                                  context: context,
                                  content: const Text(
                                    '¿Seguro que quieres salir? Los cambios no guardados se perderan',
                                  ),
                                );
                                if (!confirmed) return;
                                await ref.read(snippetFileProvider.notifier).saveSnippetList();
                                await Future.delayed(Duration(milliseconds: 150));
                              }
                              
                              // Después de guardar, usar el estado actualizado
                              ref.read(snippetFileProvider.notifier).setActiveSnippetByKey(targetKey);
                            },
                          );
                        },
                      ),
                  ],
                ),
              ),
            )
          else
            const Text('Seleccione un archivo'),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: ElevatedButton(
              child: const Text('Añadir snippet'),
              onPressed: () {},
            ),
          ),
        ],
      ),
    );
  }
}

class SnippetTile extends ConsumerWidget {
  final String snippetKey;
  final String prefix;
  final String description;
  final VoidCallback onTap;

  const SnippetTile({
    super.key,
    required this.snippetKey,
    required this.prefix,
    required this.description,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var isSelected = ref.watch(snippetFileProvider.select((s) => s?.activeSnippet?.key == snippetKey));
    return Container(
      color: isSelected ? Theme.of(context).primaryColor : Colors.transparent,
      child: ListTile(
        title: Text(prefix),
        subtitle: Text(description, maxLines: 2),
        selected: isSelected,
        selectedColor: Colors.white,
        onTap: onTap,
      ),
    );
  }
}
