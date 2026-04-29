import 'package:aisnippets/components/drawer_files.dart';
import 'package:aisnippets/components/ia/PopupContent.dart';
import 'package:aisnippets/components/drawer_snippets.dart';
import 'package:aisnippets/components/snippets_web_page.dart';
import 'package:flutter/material.dart';

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
              child: DrawerFilesLoader(),
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
            DrawerSnippets(),
          ],
        ),
        IaButton(),
      ],
    );
  }
}
