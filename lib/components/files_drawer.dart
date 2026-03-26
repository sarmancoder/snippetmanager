import 'package:aisnippets/components/add_file_button.dart';
import 'package:aisnippets/components/snippets_drawer.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/providers/directory_provider.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class FilesDrawerLoader extends ConsumerWidget {
  const FilesDrawerLoader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var appProviderAsync = ref.watch(directoryProviderProvider);
    return appProviderAsync.when(
      loading: () => Center(child: const CircularProgressIndicator()),
      error: (err, stack) => Text('Error: $err'),
      data: (d) => FilesDrawer(),
    );
  }
}

class FilesDrawer extends ConsumerWidget {
  const FilesDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var files = ref.watch(
      directoryProviderProvider.select((val) => val.value?.files ?? [])
    );
    var currentPath = ref.watch(
      directoryProviderProvider.select((val) => val.value?.currentPath ?? '')
    );
    return Column(
      children: [
        Container(
          // height: 150,
          width: double.infinity,
          color: Theme.of(context).primaryColorDark,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 2),
          child: Row(
            children: [
              IconButton(
                icon: Icon(Icons.folder),
                onPressed: () async {
                  String? selectedDirectory = await FilePicker.platform.getDirectoryPath();
                  if (selectedDirectory == null) return;
                  ref.read(directoryProviderProvider.notifier).changeDirtory(selectedDirectory);
                },
                tooltip: 'Descripción',
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () async {
                    await ref
                        .read(directoryProviderProvider.notifier)
                        .openDirectory();
                  },
                  child: Text(
                    currentPath,
                    maxLines: 2,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              children: [
                for (var i = 0; i < files.length; i++)
                  SnippetFile(nameFile: files[i].name)
              ],
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(vertical: 8.0),
          child: AddFileButton(),
        ),
      ],
    );
  }
}

class SnippetFile extends ConsumerStatefulWidget {
  final String nameFile;
  const SnippetFile({super.key, required this.nameFile});

  @override
  ConsumerState<SnippetFile> createState() => _SnippetFileState();
}

class _SnippetFileState extends ConsumerState<SnippetFile> {
  @override
  Widget build(BuildContext context) {
    var snippetFile = ref.watch(snippetFileProvider);
    var selected = snippetFile?.fileName == widget.nameFile;
    return HoverableWidget(
      builder: (hovered) {
        return Container(
          color: selected ? Theme.of(context).primaryColor : Colors.white,
          child: ListTile(
            dense: true,
            title: Text(widget.nameFile),
            selectedColor: Colors.white,
            trailing: IconButton(
              icon: Icon(Icons.delete, color: hovered ? Colors.red : Colors.transparent,),
              onPressed: () async {
                var response = await confirm(context: context, content: Text("¿Estás seguro que quieres eliminar el archivo?"));
                if (!response) return;
                await ref.read(directoryProviderProvider.notifier).deleteFile(widget.nameFile);
              },
            ),
            selected: selected,
            onTap: () async {
              var snippets = ref.read(snippetFileProvider);
              if (snippets != null && !snippets.saved) {
                var saved = await ref.read(snippetFileProvider.notifier).askForSave(context);
                if (!saved) return;
              }
              var currentPath = ref.read(directoryProviderProvider).requireValue.currentPath;
              ref.read(snippetFileProvider.notifier).setActiveFile(currentPath, widget.nameFile);
            },
          ),
        );
      }
    );
  }
}
