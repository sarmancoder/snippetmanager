import 'package:aisnippets/components/files_drawer.dart';
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
          child: FilesDrawer(),
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

class SnippetsDrawer extends StatelessWidget {
  const SnippetsDrawer({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      color: Colors.white,
      child: Column(
        children: [
          Container(
            // height: 150,
            width: double.infinity,
            color: Theme.of(context).colorScheme.secondary,
            padding: const EdgeInsets.all(16),
            child: const Align(
              alignment: Alignment.bottomLeft,
              child: Text(
                'Panel de\nDetalles',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Este panel derecho también se mantiene visible todo el tiempo.',
              style: TextStyle(color: Colors.black87),
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}
