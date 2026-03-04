import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/providers/currentPath.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

class SaveButton extends ConsumerWidget {
  const SaveButton({super.key});

  Widget build(BuildContext context, WidgetRef ref) {
    var saved = ref.watch(savedProvider);
    var currentPath = ref.watch(currentPathProvider);
    var currentFile = ref.watch(activeSnippetFileProvider);
    var currentSnippet = ref.watch(activeSnippetProvider);

    ref.listen(activeSnippetProvider, (prev, curr) async {
      if (prev == null || curr == null) return;
      if (prev.isEmpty() || curr.isEmpty()) return;
      if (prev.equals(curr)) return;
      if (prev.key != curr.key) return;
      ref.read(savedProvider.notifier).setSaved(false);
    });

    return IconButton(
      icon: Icon(Icons.save, color: saved ? Colors.white : Colors.red),
      onPressed: () async {
        var state = ref.read(snippetListProvider);
        if (currentSnippet != null) {
          state = ref
              .read(snippetListProvider.notifier)
              .updateSnippet(
                Snippet(
                  prefix: currentSnippet.prefix,
                  description: currentSnippet.description,
                  body: currentSnippet.body,
                  scope: currentSnippet.scope,
                  key: currentSnippet.key,
                ),
              );
        }
        var file = p.join(currentPath, currentFile);
        await saveSnippetList(file, state);
        ref.read(savedProvider.notifier).setSaved(true);
      },
      tooltip: 'salvar',
    );
  }
}
