  import 'package:aisnippets/components/ia/ConfigButton.dart';
  import 'package:aisnippets/config/theme.dart';
  import 'package:aisnippets/providers/snippet_file.dart';
  import 'package:aisnippets/providers/ui.dart';
  import 'package:flutter/material.dart';
  import 'package:flutter_riverpod/flutter_riverpod.dart';

  class MyAppBar extends StatelessWidget  implements PreferredSizeWidget {
    const MyAppBar({super.key});

    @override
    Widget build(BuildContext context) {
      return AppBar(
        title: const Text(
        'AiSnippets',
        overflow: TextOverflow.ellipsis,
      ),
      titleSpacing: 0, // reduce espacio extra
        actions: [
          DarkModeToggle(),
          SaveButton(),
          ConfigButton()
        ],
      );
    }

    @override
    Size get preferredSize => const Size.fromHeight(kToolbarHeight);
  }

  class DarkModeToggle extends ConsumerWidget {
    const DarkModeToggle({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
      var brighness = ref.read(uiBrightnessProvider);
      var isDark = brighness == Brightness.dark;
      return IconButton(
        icon: Icon(isDark ? Icons.dark_mode : Icons.light_mode),
        onPressed: () {
          ref.read(uiBrightnessProvider.notifier).toggle();
        },
      );
    }
  }

  class SaveButton extends ConsumerWidget {
    const SaveButton({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
      var saved = ref.watch(snippetFileProvider);
      var isDark = Theme.of(context).brightness == Brightness.dark;
      var color = isDark ? Colors.white : Colors.black;
      var blackColor = color.withAlpha(saved?.activeSnippet == null ? 100 : 255);
      return IconButton(
        icon: Icon(Icons.save, color: saved == null || saved.saved ? blackColor : redColor),
        onPressed: saved == null ? null : () async {
          await ref.read(snippetFileProvider.notifier).saveSnippetList();
        },
        tooltip: 'Salvar snippet',
      );
    }
  }