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
                      SnippetTile(snippet: snippets.snippets[i]),
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

class SnippetTile extends ConsumerStatefulWidget {
  final Snippet snippet;
  const SnippetTile({super.key, required this.snippet});

  @override
  ConsumerState<SnippetTile> createState() => _SnippetTileState();
}

class _SnippetTileState extends ConsumerState<SnippetTile> {
  @override
  Widget build(BuildContext context) {
    var snippetsState = ref.watch(snippetFileProvider);
    var selected = snippetsState?.activeSnippet?.key == widget.snippet.key;
    return Container(
      color: selected ? Theme.of(context).primaryColor : Colors.transparent,
      child: ListTile(
        title: Text(widget.snippet.prefix),
        subtitle: Text(widget.snippet.description, maxLines: 2),
        selected: selected,
        selectedColor: Colors.white,
        onTap: () async {
          var save = await continueIfNotSaved();
          if (!save) return;
          ref
              .read(snippetFileProvider.notifier)
              .setActiveSnippet(widget.snippet);
        },
      ),
    );
  }

  continueIfNotSaved() async {
    var active = ref.read(snippetFileProvider);
    var saved = active!.saved;
    var activeSnippet = active!.activeSnippet;
    if (!saved && activeSnippet != null) {
      var confirmed = await confirm(
        context: context,
        content: const Text(
          '¿Seguro que quieres salir? Los cambios no guardados se perderan',
        ),
      );
      if (!confirmed)
        return false;
      else {
        await ref.read(snippetFileProvider.notifier).saveSnippetList();
        await Future.delayed(Duration(milliseconds: 100));
        return true;
      }
    }
    return true;
  }
}
