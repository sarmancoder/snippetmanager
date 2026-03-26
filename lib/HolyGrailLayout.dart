import 'package:aisnippets/components/files_drawer.dart';
import 'package:aisnippets/components/ia/PopupContent.dart';
import 'package:aisnippets/components/snippets_drawer.dart';
import 'package:aisnippets/components/snippets_web_page.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:popover/popover.dart';

class HolyGrailLayout extends StatelessWidget {
  const HolyGrailLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Row(
          children: [
            // --- SIDEBAR IZQUIERDO PERSISTENTE ---
            SizedBox(
              width: 250,
              child: FilesDrawerLoader(),
            ),

            // Divisor visual
            const VerticalDivider(width: 1, thickness: 1),

            // --- CONTENIDO PRINCIPAL (Flexible para ocupar el resto) ---
            Expanded(
              child: SnippetsWebPage(),
            ),

            // Divisor visual
            const VerticalDivider(width: 1, thickness: 1),

            // --- PANEL DERECHO PERSISTENTE ---
            SnippetsDrawer(),
          ],
        ),
        IaButton(),
      ],
    );
  }
}
