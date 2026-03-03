import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/providers/currentPath.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;


class SaveButton extends ConsumerStatefulWidget {
  const SaveButton({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _SaveButtonState();
}

class _SaveButtonState extends ConsumerState<SaveButton> {
  bool saved = true;

  @override
  Widget build(BuildContext context) {
    var currentPath = ref.watch(currentPathProvider);
    var currentFile = ref.watch(activeSnippetFileProvider);
    var currentSnippet = ref.watch(activeSnippetProvider);

    ref.listen(activeSnippetProvider, (c, s) async {
      setState(() {
        saved = false;
      });
    });

    return IconButton(
      icon: Icon(Icons.save, color: saved ? Colors.white : Colors.red,),
      onPressed: () async {
        if (currentSnippet == null) return;
        var state = ref.read(snippetListProvider.notifier).updateSnippet(
          Snippet(
            prefix: currentSnippet.prefix,
            description: currentSnippet.description,
            body: currentSnippet.body,
            key: currentSnippet.key
          )
        );
        var file = p.join(currentPath, currentFile);
        await saveSnippetList(file, state);
        setState(() {
          saved = true;
        });
      },
      tooltip: 'salvar',
    );
  }
}

