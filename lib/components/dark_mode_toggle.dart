import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DarkModeToggle extends ConsumerWidget {
  const DarkModeToggle({
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var darkMode = ref.watch(darkModeProvider);
    return IconButton(
      icon: Icon(darkMode ? Icons.dark_mode : Icons.sunny),
      onPressed: () async {
        ref.read(darkModeProvider.notifier).toggle();
      },
      tooltip: 'Poner modo noche',
    );
  }
}