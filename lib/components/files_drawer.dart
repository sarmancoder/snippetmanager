import 'package:aisnippets/providers/directory_provider.dart';
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
          color: Theme.of(context).colorScheme.primary,
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
                  ListTile(
                    dense: true,
                    title: Text(files[i].name),
                    onTap: () {},
                  ),
              ],
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(vertical: 8.0),
          child: ElevatedButton(
            child: const Text('Añadir archivo'),
            onPressed: () {},
          ),
        ),
      ],
    );
  }
}
