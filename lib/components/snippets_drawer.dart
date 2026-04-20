import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/config/theme.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/dialogs/createSnippet.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SnippetsDrawer extends ConsumerWidget {
  const SnippetsDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var snippets = ref.watch(snippetFileProvider);
    var theme = Theme.of(context);

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
                      for (var i = 0; i < snippets.snippets.length; i++)
                        Builder(
                          builder: (context) {
                            var snippet = snippets.snippets[i];
                            return SnippetTile(
                              key: ValueKey(snippet.key),
                              snippet: snippet,
                              snippetKey: snippet.key,
                              prefix: snippet.prefix,
                              description: snippet.description,
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
                          
                        print("creando snippet");
                        Navigator.of(context).pop();
                        ref.read(snippetFileProvider.notifier).addToList(snippet);
                        await ref.read(snippetFileProvider.notifier).saveSnippetList();
                        ref.read(snippetFileProvider.notifier).setActiveSnippetByKey(snippet.key);
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

class SnippetTile extends ConsumerWidget {
  final String snippetKey;
  final String prefix;
  final String description;
  final VoidCallback onTap;
  final Snippet snippet;

  const SnippetTile({
    super.key,
    required this.snippetKey,
    required this.prefix,
    required this.description,
    required this.onTap, required this.snippet,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var isSelected = ref.watch(
      snippetFileProvider.select((s) => s?.activeSnippet?.key == snippetKey),
    );
    return HoverableWidget(
      builder: (hovered) {
        return Draggable(
          data: snippet,
          feedback: Text("Feedback"),
          childWhenDragging: Text("Dragging"),
          child: Container(
            color: isSelected ? Theme.of(context).primaryColor : Colors.transparent,
            child: ListTile(
              title: Text(prefix),
              subtitle: Text(description, maxLines: 2),
              selected: isSelected,
              trailing: IconButton(
                icon:  Icon(Icons.delete, color: hovered ? redColor : Colors.transparent),
                onPressed: () async {
                  var confirmed = await confirm(context: context, content: Text("¿Estás seguro de eliminar el snippet?"));
                  if (!confirmed) return;
                  ref.read(snippetFileProvider.notifier).removeFromList(snippetKey);
                  await ref.read(snippetFileProvider.notifier).saveSnippetList();
                  ref.read(snippetFileProvider.notifier).closeActiveSnippet();
                },
              ),
              onTap: onTap,
            ),
          ),
        );
      }
    );
  }
}

class HoverableWidget extends StatefulWidget {
  final Widget Function(bool hovered) builder;

  const HoverableWidget({super.key, required this.builder});

  @override
  State<HoverableWidget> createState() => _HoverableWidgetState();
}

class _HoverableWidgetState extends State<HoverableWidget> {
  bool hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (event) {
        setState(() {
          hovered = true;
        });
      },
      onExit: (event) {
        setState(() {
          hovered = false;
        });
      },
      child: widget.builder(hovered),
    );
  }
}
