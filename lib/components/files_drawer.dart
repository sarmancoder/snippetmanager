import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/components/add_file_button.dart';
import 'package:aisnippets/components/snippets_drawer.dart';
import 'package:aisnippets/config/theme.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/dialogs/prompt.dart';
import 'package:aisnippets/providers/directory_provider.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart';
import 'package:aisnippets/business/models/SnippetFile.dart' as SF;

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
    var theme = Theme.of(context);
    var files = ref.watch(
      directoryProviderProvider.select((val) => val.value?.files ?? []),
    );
    var currentPath = ref.watch(
      directoryProviderProvider.select((val) => val.value?.currentPath ?? ''),
    );
    return Container(
      color: theme.drawerTheme.backgroundColor,
      child: Column(
        children: [
          Container(
            // height: 150,
            width: double.infinity,
            color: Theme.of(context).primaryColor,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 2),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(Icons.folder),
                  onPressed: () async {
                    String? selectedDirectory = await FilePicker.platform
                        .getDirectoryPath();
                    if (selectedDirectory == null) return;
                    ref
                        .read(directoryProviderProvider.notifier)
                        .changeDirtory(selectedDirectory);
                  },
                  tooltip: 'Descripción',
                ),
                Expanded(
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: GestureDetector(
                      onTap: () async {
                        await ref
                            .read(directoryProviderProvider.notifier)
                            .openDirectory();
                      },
                      child: Text(
                        currentPath,
                        maxLines: 2,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          SingleChildScrollView(
            child: Column(
              children: [
                for (var i = 0; i < files.length; i++)
                  SnippetFile(
                    nameFile: files[i].name,
                    onSnippetDropped: (snippetToInsert) async {
                      var fileName = files[i].name;
                      var snippetsFile = await getFileSnippets(files[i]);
                      await saveSnippetList(join(currentPath, fileName), [
                        ...snippetsFile,
                        snippetToInsert,
                      ]);
                      if (ref.read(snippetFileProvider)?.activeSnippet?.key ==
                          snippetToInsert.key) {
                        ref
                            .read(snippetFileProvider.notifier)
                            .closeActiveSnippet();
                      }
                      ref
                          .read(snippetFileProvider.notifier)
                          .removeFromList(snippetToInsert.key);
                      ref.read(snippetFileProvider.notifier).saveSnippetList();
                    },
                  ),
              ],
            ),
          ),
          Expanded(
            child: DragTarget<Snippet>(
              onAcceptWithDetails: (data) async {
                var fn = await prompt(
                  context: context,
                  title: "Nombre del nuevo archivo",
                );
                if (fn.isEmpty) return;
                var fileName = fn + ".code-snippets";
                Navigator.of(context).pop();
                await saveSnippetList(join(currentPath, fileName), [data.data]);
                if (ref.read(snippetFileProvider)?.activeSnippet?.key ==
                    data.data.key) {
                  ref.read(snippetFileProvider.notifier).closeActiveSnippet();
                }
                ref
                    .read(snippetFileProvider.notifier)
                    .removeFromList(data.data.key);
                ref
                    .read(directoryProviderProvider.notifier)
                    .addNewFileToList(
                      SF.SnippetFile(name: fileName, path: currentPath),
                    );
                ref.read(snippetFileProvider.notifier).saveSnippetList();
              },
              builder: (c, d, __) {
                print('dtectado drag ' + d.length.toString());
                var color = Colors.black;
                return AnimatedContainer(
                  duration: Duration(milliseconds: 250),
                  color: d.isNotEmpty
                      ? color.withAlpha(100)
                      : color.withAlpha(0),
                  height: 200,
                );
              },
            ),
          ),
          Row(
            children: [
              Expanded(
                child: Padding(
                  padding: EdgeInsets.all(8),
                  child: AddFileButton(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class SnippetFile extends ConsumerStatefulWidget {
  final String nameFile;
  final Function(Snippet snippetToInsert) onSnippetDropped;
  const SnippetFile({
    super.key,
    required this.nameFile,
    required this.onSnippetDropped,
  });

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
        return DragTarget<Snippet>(
          onAcceptWithDetails: (details) {
            widget.onSnippetDropped(details.data);
          },
          builder: (context, candidateData, rejectedData) {
            var color = Colors.black;
            return AnimatedContainer(
              duration: Duration(milliseconds: 500),
              color: candidateData.isEmpty ? color.withAlpha(0) : color.withAlpha(150),
              child: ListTile(
                dense: true,
                title: Text(widget.nameFile),
                trailing: IconButton(
                  icon: Icon(
                    Icons.delete,
                    color: hovered ? redColor : Colors.transparent,
                  ),
                  onPressed: () async {
                    var response = await confirm(
                      context: context,
                      content: Text(
                        "¿Estás seguro que quieres eliminar el archivo?",
                      ),
                    );
                    if (!response) return;
                    await ref
                        .read(directoryProviderProvider.notifier)
                        .deleteFile(widget.nameFile);
                  },
                ),
                selected: selected,
                onTap: () async {
                  var snippets = ref.read(snippetFileProvider);
                  if (snippets != null && !snippets.saved) {
                    var saved = await ref
                        .read(snippetFileProvider.notifier)
                        .askForSave(context);
                    if (!saved) return;
                  }
                  var currentPath = ref
                      .read(directoryProviderProvider)
                      .requireValue
                      .currentPath;
                  ref
                      .read(snippetFileProvider.notifier)
                      .setActiveFile(currentPath, widget.nameFile);
                },
              ),
            );
          },
        );
      },
    );
  }
}
