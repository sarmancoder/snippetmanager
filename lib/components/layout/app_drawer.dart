import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:aisnippets/providers/currentPath.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

class AppDrawer extends StatelessWidget {
  final double drawerWidth;

  const AppDrawer({Key? key, required this.drawerWidth}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var drawerTheme = theme.drawerTheme;
    // var fgColor = drawerTheme.
    var bgColor = drawerTheme.backgroundColor;

    return Container(
      // Aquí defines qué tan largo quieres que sea
      height: MediaQuery.of(context).size.height - kToolbarHeight,
      width: drawerWidth,
      color: bgColor,
      child: Column(
        children: [
          CurrentSnippetPath(),
          DrawerHeader(),
          Expanded(child: SnippetList()),
          Padding(
            padding: const EdgeInsets.all(32.0),
            child: ElevatedButton(
              child: const Text('Crear snippet'),
              onPressed: () {},
            ),
          ),
        ],
      ),
    );
  }
}

class SnippetList extends ConsumerWidget {
  const SnippetList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var sl = ref.watch(snippetListProvider);
    var activeSnippet = ref.watch(activeSnippetProvider);
    var theme = Theme.of(context);
    var pc = theme.primaryColor;
    return ListView.separated(
      itemCount: sl.length,
      separatorBuilder: (c, p) {
        return Divider();
      },
      itemBuilder: (c, i) {
        var snippet = sl[i];
        var itemActive = snippet.key == activeSnippet?.key;
        return ListTile(
          leading: Icon(Icons.circle, color: itemActive ? pc : Colors.transparent,),
          title: Text(snippet.prefix),
          subtitle: Text(snippet.description),
          onTap: () {
            ref.read(activeSnippetProvider.notifier).setActiveSnippet(snippet);
          },
        );
      },
    );
  }
}

class CurrentSnippetPath extends ConsumerWidget {
  const CurrentSnippetPath({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var path = ref.watch(currentPathProvider);
    return Padding(
      padding: EdgeInsets.all(8),
      child: Text(
        path,
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.bodyLarge,
      ),
    );
  }
}

class DrawerHeader extends ConsumerWidget {
  const DrawerHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var snippetFiles = ref.watch(snippetsFilesProvider);
    var currentSnippet = ref.watch(activeSnippetFileProvider);

    var items = snippetFiles.map((e) {
      return DropdownMenuItem(value: e.name, child: Text(e.name));
    }).toList();

    ref.listen(activeSnippetFileProvider, (prev, next) async {
      var currentPath = ref.read(currentPathProvider);
      var file = SnippetFile(path: currentPath, name: ref.read(activeSnippetFileProvider));
      var snippets = await getFileSnippets(file);
      ref.read(snippetListProvider.notifier).setList(snippets);
    });

    return Row(
      children: [
        Expanded(
          child: DropdownButton<String>(
            value: currentSnippet,
            items: items,
            onChanged: (String? c) async {
              ref.read(activeSnippetFileProvider.notifier).setActiveSnippet(c!);
            },
          ),
        ),
        IconButton(onPressed: () {}, icon: Icon(Icons.folder)),
      ],
    );
  }
}
