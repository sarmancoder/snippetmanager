import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/components/HoverableWidget.dart';
import 'package:aisnippets/config/theme.dart';
import 'package:aisnippets/dialogs/MoveSnippetToFile.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/dialogs/createSnippet.dart';
import 'package:aisnippets/providers/directory_provider.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DrawerSnippets extends ConsumerWidget {
  const DrawerSnippets({super.key});

  List<Snippet> getSortedSnippets(List<Snippet> snippets) {
    if (snippets.isEmpty) return [];
    
    // Creamos una copia de la lista antes de ordenar, a
    // ya que .sort() modifica la lista original y las listas de Freezed son inmutables.
    return [...snippets]..sort((a, b) => 
      a.prefix.toLowerCase().compareTo(b.prefix.toLowerCase())
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var snippets = ref.watch(snippetFileProvider);
    var theme = Theme.of(context);
    var sortedSnippets = getSortedSnippets(snippets?.snippets ?? []);

    return SizedBox(
      width: 250,
      child: Container(
        color: theme.drawerTheme.backgroundColor,
        child: Column(
          children: [
            if (snippets != null)
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      for (var i = 0; i < sortedSnippets.length; i++)
                        Builder(
                          builder: (context) {
                            var snippet = sortedSnippets[i];
                            return SnippetTileDraggable(
                              key: ValueKey(snippet.key),
                              snippet: snippet,
                              snippetKey: snippet.key,
                              onDoubleTap: () async {
                                var fileName = await promptSnippetFile(context);
                                Navigator.of(context).pop();ref
                                    .read(directoryProviderProvider.notifier)
                                    .moveSnippetToFile(fileName, snippet);
                              },
                              onTap: () async {
                                var saved = await ref
                                    .read(snippetFileProvider.notifier)
                                    .askForSave(context);
                                if (!saved) return;
                                ref
                                    .read(snippetFileProvider.notifier)
                                    .setActiveSnippetByKey(snippet.key);
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
            Row(
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: ElevatedButton(
                      child: const Text('Añadir snippet'),
                      onPressed: () async {
                        var saved = await ref
                            .read(snippetFileProvider.notifier)
                            .askForSave(context);
                        if (!saved) return;
                        if (!context.mounted) return;

                        var snippet = await createSnippet(context: context);
                        if (snippet == null) {
                          Navigator.of(context).pop();
                          return;
                        }
                        Navigator.of(context).pop();
                        ref
                            .read(snippetFileProvider.notifier)
                            .addToList(snippet);
                        await ref
                            .read(snippetFileProvider.notifier)
                            .saveSnippetList();
                        ref
                            .read(snippetFileProvider.notifier)
                            .setActiveSnippetByKey(snippet.key);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class SnippetTileDraggable extends ConsumerWidget {
  final String snippetKey;
  final VoidCallback onTap;
  final VoidCallback onDoubleTap;
  final Snippet snippet;

  const SnippetTileDraggable({
    super.key,
    required this.snippetKey,
    required this.onTap,
    required this.onDoubleTap,
    required this.snippet,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var isSelected = ref.watch(
      snippetFileProvider.select((s) => s?.activeSnippet?.key == snippetKey),
    );
    var snippetTileDragging = SnippetTile(
      dragging: true,
      hovered: false,
      isSelected: isSelected,
      snippet: snippet,
      snippetKey: snippetKey,
      onTap: onTap,
      onRemove: () {},
      onDoubleTap: onDoubleTap,
    );
    return HoverableWidget(
      builder: (hovered) {
        return Draggable(
          data: snippet,
          feedback: SizedBox(
            width: 350,
            child: Material(child: snippetTileDragging),
          ),
          childWhenDragging: snippetTileDragging,
          child: SnippetTile(
            hovered: hovered,
            onDoubleTap: onDoubleTap,
            isSelected: isSelected,
            snippet: snippet,
            snippetKey: snippetKey,
            onTap: onTap,
            onRemove: () async {
              var spProvider = ref.read(snippetFileProvider.notifier);
              var confirmed = await confirm(
                context: context,
                content: Text("¿Estás seguro de eliminar el snippet?"),
              );
              if (!confirmed) return;
              ref.read(snippetFileProvider.notifier).removeFromList(snippetKey);
              await ref.read(snippetFileProvider.notifier).saveSnippetList();
              spProvider.closeActiveSnippet();
            },
          ),
        );
      },
    );
  }
}

class SnippetTile extends StatelessWidget {
  const SnippetTile({
    super.key,
    required this.isSelected,
    required this.snippet,
    required this.snippetKey,
    required this.onTap,
    required this.onDoubleTap,
    this.dragging = false,
    required this.onRemove,
    required this.hovered,
  });

  final bool dragging;
  final bool isSelected;
  final Snippet snippet;
  final String snippetKey;
  final VoidCallback onTap;
  final VoidCallback onDoubleTap;
  final bool hovered;

  final Function() onRemove;

  @override
  Widget build(BuildContext context) {
    var snippetColor = Theme.of(context).primaryColor;
    return Container(
      color: dragging
          ? snippetColor.withAlpha(50)
          : isSelected
          ? snippetColor
          : Colors.transparent,
      child: GestureDetector(
        onTap: onTap,
        onDoubleTap: onDoubleTap,
        child: ListTile(
          title: Text(snippet.prefix),
          subtitle: Text(snippet.description, maxLines: 2),
          selected: isSelected,
          trailing: IconButton(
            icon: Icon(
              Icons.delete,
              color: hovered ? redColor : Colors.transparent,
            ),
            onPressed: () async {
              onRemove();
            },
          ),
        ),
      ),
    );
  }
}
