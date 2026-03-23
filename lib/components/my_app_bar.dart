import 'package:aisnippets/providers/snippet_file.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MyAppBar extends StatelessWidget  implements PreferredSizeWidget {
  const MyAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text('AiSnippets'),
      actions: [
        SaveButton()
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class SaveButton extends ConsumerWidget {
  const SaveButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var saved = ref.watch(snippetFileProvider);
    var blackColor = Colors.black.withAlpha(saved?.activeSnippet == null ? 100 : 255);
    return IconButton(
      icon: Icon(Icons.save, color: saved == null || saved.saved ? blackColor : Colors.red),
      onPressed: () {
        if (saved == null) return;
      },
      tooltip: 'Salvar snippet',
    );
  }
}