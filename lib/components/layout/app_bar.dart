import 'package:aisnippets/components/dark_mode_toggle.dart';
import 'package:aisnippets/components/save_button.dart';
import 'package:flutter/material.dart';

class SnippetsAppBar extends StatelessWidget implements PreferredSizeWidget {
  const SnippetsAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text('AiSnippets'),
      actions: [
        DarkModeToggle(),
        SaveButton(),
      ],
    );
  }
  
  @override
  // TODO: implement preferredSize
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
