import 'package:aisnippets/components/files_drawer.dart';
import 'package:aisnippets/components/snippets_drawer.dart';
import 'package:aisnippets/components/snippets_web_page.dart';
import 'package:flutter/material.dart';

class HolyGrailLayout extends StatelessWidget {
  const HolyGrailLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // --- SIDEBAR IZQUIERDO PERSISTENTE ---
        Container(
          width: 250,
          color: Colors.white,
          child: FilesDrawerLoader(),
        ),

        // Divisor visual
        const VerticalDivider(width: 1, thickness: 1),

        // --- CONTENIDO PRINCIPAL (Flexible para ocupar el resto) ---
        Expanded(
          child: Container(
            color: Colors.grey[100],
            child: SnippetsWebPage()
          ),
        ),

        // Divisor visual
        const VerticalDivider(width: 1, thickness: 1),

        // --- PANEL DERECHO PERSISTENTE ---
        SnippetsDrawer(),
      ],
    );
  }
}
