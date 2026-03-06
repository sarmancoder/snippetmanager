import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:aisnippets/components/ConfigButton.dart';
import 'package:aisnippets/components/dark_mode_toggle.dart';
import 'package:aisnippets/components/save_button.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/providers/currentPath.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

class SnippetsAppBar extends StatelessWidget implements PreferredSizeWidget {
  const SnippetsAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: CurrentDirectory(),
      actions: [DarkModeToggle(), SaveButton(), ConfigButton()],
    );
  }

  @override
  // TODO: implement preferredSize
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class CurrentDirectory extends ConsumerWidget {
  const CurrentDirectory({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var tc = Theme.of(context);
    var currentDirectory = ref.watch(currentPathProvider);

    return Row(
      mainAxisSize: MainAxisSize.min, // Ocupa solo el espacio necesario
      children: [
        IconButton(
          icon: const Icon(Icons.folder_open, size: 30),
          onPressed: () async {
            var saved = ref.read(savedProvider);
            if (!saved) {
              var save = await confirm(context: context, content: Text("¿Salvar los cambios?"));
              if (save) {
                var currentPath = ref.read(currentPathProvider);
                var currentFile = ref.read(activeSnippetFileProvider);
                var currentSnippet = ref.read(activeSnippetProvider);
                var state = ref.read(snippetListProvider);
                if (currentSnippet != null) {
                  state = ref
                      .read(snippetListProvider.notifier)
                      .updateSnippet(
                        Snippet(
                          prefix: currentSnippet.prefix,
                          description: currentSnippet.description,
                          body: currentSnippet.body,
                          scope: currentSnippet.scope,
                          key: currentSnippet.key,
                        ),
                      );
                }
                var file = p.join(currentPath, currentFile);
                await saveSnippetList(file, state);
                ref.read(savedProvider.notifier).setSaved(true);
              }
            }

            String? selectedDirectory = await FilePicker.platform
                .getDirectoryPath();
            if (selectedDirectory != null) {
              ref.read(currentPathProvider.notifier).setPath(selectedDirectory);
              var filesList = await loadDirectory(selectedDirectory);
              if (filesList.isEmpty) return;

              var snippetList = await getFileSnippets(filesList[0]);

              ref.read(snippetsFilesProvider.notifier).setList(filesList);
              ref
                  .read(activeSnippetFileProvider.notifier)
                  .setActiveSnippet(filesList[0].name);
              ref.read(snippetListProvider.notifier).setList(snippetList);
            }
          },
          tooltip: 'Seleccionar un directorio',
        ),
        Flexible(
          child: Column(
            mainAxisSize: MainAxisSize.min, // Centra el contenido verticalmente
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                currentDirectory,
                overflow: TextOverflow.ellipsis, // Por si la ruta es muy larga
                style: tc.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const FileDropdown(), // Sin Expanded aquí
            ],
          ),
        ),
      ],
    );
  }
}

class FileDropdown extends ConsumerWidget {
  const FileDropdown({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var currentPath = ref.watch(currentPathProvider);
    var snippetFiles = ref.watch(snippetsFilesProvider);
    var currentSnippet = ref.watch(activeSnippetFileProvider);

    print(currentPath);
    print(currentSnippet);
    print(snippetFiles.map((a) => a.name));

    var items = snippetFiles.map((e) {
      return DropdownMenuItem(value: e.name, child: Text(e.name));
    }).toList();

    // Tu lógica de ref.listen está perfecta aquí

    return DropdownButtonHideUnderline(
      // Limpia la línea fea de abajo
      child: DropdownButton<String>(
        value: currentSnippet,
        items: items,
        isDense: true, // Muy importante para que quepa en el AppBar
        iconEnabledColor: Colors.white,
        style: const TextStyle(fontSize: 14, color: Colors.white),
        dropdownColor: Colors.grey[900], // Para que se vea bien en modo oscuro
        onChanged: (String? c) {
          if (c != null) {
            ref.read(activeSnippetFileProvider.notifier).setActiveSnippet(c);
          }
        },
      ),
    );
  }
}
