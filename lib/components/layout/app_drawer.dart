import 'dart:async';

import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:aisnippets/config/theme.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/dialogs/createSnippet.dart';
import 'package:aisnippets/providers/currentPath.dart';
import 'package:aisnippets/providers/services.dart';
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
      // color: bgColor,
      child: Column(
        children: [
          // CurrentSnippetPath(),
          // DrawerHeader(),
          Expanded(child: SnippetList()),
          Row(
            children: [
              Expanded(child: CreateSnippetButton()),
            ],
          ),
        ],
      ),
    );
  }
}

class CreateSnippetButton extends ConsumerWidget {
  const CreateSnippetButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var sl = ref.watch(snippetListProvider);
    var activeSnippet = ref.watch(activeSnippetProvider);
    var saved = ref.watch(savedProvider);

    continueIfNotSaved() async {
      if (!saved && activeSnippet != null) {
        var confirmed = await confirm(
          context: context,
          content: const Text(
            '¿Seguro que quieres salir? Los cambios no guardados se perderan',
          ),
        );
        if (!confirmed)
          return false;
        else {
          ref.read(savedProvider.notifier).setSaved(true);
          await Future.delayed(Duration(milliseconds: 100));
          return true;
        }
      }
      return true;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32.0),
      child: ElevatedButton(
        child: const Text('Crear snippet'),
        onPressed: () async {
          if (!(await continueIfNotSaved())) {
            return;
          }
          if (!context.mounted) return;

          var snippet = await createSnippet(context: context);
          if (snippet == null) {
            Navigator.of(context).pop();
            return;
          }

          print("creando snippet");
          Navigator.of(context).pop();
          ref.read(snippetListProvider.notifier).addToList(snippet);
        },
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
    var saved = ref.watch(savedProvider);

    continueIfNotSaved() async {
      if (!saved && activeSnippet != null) {
        var save = await confirm(
          context: context,
          content: Text("¿Salvar los cambios?"),
        );
        if (save) {
          await ref.read(servicesProvider.notifier).saveCurrentSnippet();
        } else {
          return false;
        }
        await Future.delayed(Duration(milliseconds: 100));
        return true;
      }
      return true;
    }

    return ListView.separated(
      itemCount: sl.length,
      separatorBuilder: (c, p) {
        return Divider();
      },
      itemBuilder: (c, i) {
        var snippet = sl[i];
        var itemActive = snippet.key == activeSnippet?.key;
        return SnippetTile(
          snippet: snippet,
          itemActive: itemActive,
          onRemove: () {
            ref.read(snippetListProvider.notifier).removeFromList(snippet);
            ref.read(savedProvider.notifier).setSaved(false);
            ref.read(activeSnippetProvider.notifier).setActiveSnippet(null);
          },
          onTap: () async {
            if (!(await continueIfNotSaved())) return;
            ref.read(activeSnippetProvider.notifier).setActiveSnippet(snippet);
          },
        );
      },
    );
  }
}

class SnippetTile extends StatefulWidget {
  final Snippet snippet;
  final bool itemActive;
  final Function() onTap;
  final Function() onRemove;

  const SnippetTile({
    super.key,
    required this.snippet,
    required this.itemActive,
    required this.onTap,
    required this.onRemove,
  });

  @override
  State<SnippetTile> createState() => _SnippetTileState();
}

class _SnippetTileState extends State<SnippetTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    var pc = Theme.of(context).primaryColor;
    var tc = widget.itemActive ? pc : Colors.transparent;
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: ListTile(
        minLeadingWidth: 0,
        leading: SizedBox(
          width: 10,
          child: Icon(Icons.circle, color: tc, size: 14),
        ),
        trailing: IconButton(
          onPressed: () {
            widget.onRemove();
          },
          icon: Icon(
            Icons.delete,
            color: _isHovered ? redColor : Colors.transparent,
          ),
        ),
        title: Text(widget.snippet.prefix),
        subtitle: Text(widget.snippet.description),
        onTap: widget.onTap,
      ),
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
      var file = SnippetFile(
        path: currentPath,
        name: ref.read(activeSnippetFileProvider),
      );
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
