import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'components/layout/app_bar.dart';
import 'components/layout/app_drawer.dart';
import 'components/snippets_web_page.dart';
import 'package:flutter/material.dart';

final double drawerWidth = 300;

class HomePage extends ConsumerWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var theme = Theme.of(context);
    var activeSnippet = ref.watch(activeSnippetProvider);

    if (activeSnippet == null) {
      return AppLayout(content: Center(
        child: Text("Seleccione un snippet para empezar", style: theme.textTheme.headlineMedium,),
      ));
    }
    return AppLayout(content: SnippetsWebPage());
  }
}

class AppLayout extends StatelessWidget {
  final Widget content;

  const AppLayout({super.key, required this.content});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SnippetsAppBar(),
      body: Stack(
        children: [
          // 1. Contenido principal (debe tener un margen izquierdo si no quieres que el drawer lo tape)
          Positioned(
            left: drawerWidth,
            top: kToolbarHeight,
            right: 0,
            bottom: 0,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: content,
            ),
          ),

          // 2. El "Drawer" personalizado
          Positioned(
            top: 20, // Margen superior
            left: 10, // Un poco despegado del borde si quieres
            // Quitamos bottom: 0 para que no llegue hasta abajo
            child: AppDrawer(drawerWidth: drawerWidth)
          ),
        ],
      ),
    );
  }
}

      /*SnippetsWebPage()*/