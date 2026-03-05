import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:popover/popover.dart';

import 'components/layout/app_bar.dart';
import 'components/layout/app_drawer.dart';
import 'components/snippets_web_page.dart';
import 'package:flutter/material.dart';
import 'components/PopupContent.dart';

final double drawerWidth = 300;

class HomePage extends ConsumerWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var theme = Theme.of(context);
    var activeSnippet = ref.watch(activeSnippetProvider);

    if (activeSnippet == null) {
      return AppLayout(
        fab: null,
        content: Center(
          child: Text(
            "Seleccione un snippet para empezar",
            style: theme.textTheme.headlineMedium,
          ),
        ),
      );
    }
    return AppLayout(
      fab: Builder(
        // Usamos Builder para tener el context correcto del botón
        builder: (context) => FloatingActionButton(
          child: const Icon(Icons.add_comment),
          onPressed: () {
            showPopover(
              context: context,
              bodyBuilder: (context) => const MyPopupContent(),
              onPop: () => print('Popover cerrado'),
              direction: PopoverDirection.top, // Aparece hacia arriba
              width: 500,
              height: 300,
              arrowHeight: 15,
              arrowWidth: 30,
              backgroundColor: Theme.of(context).colorScheme.surface,
            );
          },
        ),
      ),
      content: SnippetsWebPage());
  }
}

class AppLayout extends StatelessWidget {
  final Widget content;
  final Widget? fab;

  const AppLayout({super.key, required this.content, required this.fab});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SnippetsAppBar(),
      floatingActionButton: fab,
      body: Stack(
        children: [
          // 1. Contenido principal (debe tener un margen izquierdo si no quieres que el drawer lo tape)
          Positioned(
            left: drawerWidth,
            top: kToolbarHeight,
            right: 0,
            bottom: 0,
            child: Padding(padding: const EdgeInsets.all(8.0), child: content),
          ),

          // 2. El "Drawer" personalizado
          Positioned(
            top: 20, // Margen superior
            left: 10, // Un poco despegado del borde si quieres
            // Quitamos bottom: 0 para que no llegue hasta abajo
            child: AppDrawer(drawerWidth: drawerWidth),
          ),
        ],
      ),
    );
  }
}

      /*SnippetsWebPage()*/