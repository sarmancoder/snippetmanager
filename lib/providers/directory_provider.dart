import 'dart:io';

import 'package:aisnippets/business/fs.dart' as fs;
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:aisnippets/business/models/directory_state.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/snippet_file.dart' as p;
import 'package:aisnippets/providers/ui.dart';
import 'package:path/path.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:url_launcher/url_launcher.dart';

part 'directory_provider.g.dart';

@riverpod
class DirectoryProvider extends _$DirectoryProvider {
  @override
  FutureOr<DirectoryState> build() async {
    var lastDir = ref
        .read(sharedPrefsProvider)
        .getString(SharedPrefsValues.lastDirKey);
    var path = lastDir ?? fs.getVSCodePath();
    return await _loadDirectory(path);
  }

  _loadDirectory(path) async {
    var files = await fs.loadDirectory(path);
    var appState = DirectoryState(currentPath: path, files: files);
    print("cantidad de archivs " + files.length.toString());
    return appState;
  }

  changeDirtory(path) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return await _loadDirectory(path);
    });
    await ref
        .read(sharedPrefsProvider)
        .setString(SharedPrefsValues.lastDirKey, path);
  }

  openDirectory() async {
    var currentDirectory = state.requireValue.currentPath;
    var uri = Uri.directory(currentDirectory);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (Platform.isWindows) {
        await Process.run('explorer.exe', [currentDirectory]);
      } else {
        throw 'No se pudo abrir la carpeta: $currentDirectory';
      }
    }
  }

  createNewFile(String fileName, String content) async {
    var currentPath = state.requireValue.currentPath;
    await fs.createNewSnippetFile(currentPath, fileName, content);
    var newFile = SnippetFile(
      path: currentPath,
      name: fileName + ".code-snippets",
    );
    // state = AsyncValue.data(state.requireValue.copyWith(files: [...files, newFile]));
    addNewFileToList(newFile);
  }

  addNewFileToList(SnippetFile newFile) {
    var files = state.requireValue.files;
    var updatedFiles = [...files, newFile];
    updatedFiles.sort((a, b) => a.name.compareTo(b.name));
    state = AsyncValue.data(state.requireValue.copyWith(files: updatedFiles));
  }

  deleteFile(String fileName) async {
    await fs.deleteFile(state.requireValue.currentPath, fileName);
    var s = state.requireValue;
    state = AsyncValue.data(
      s.copyWith(files: [...s.files].where((f) => f.name != fileName).toList()),
    );
    var snippetFile = ref.read(p.snippetFileProvider);
    if (fileName == snippetFile?.fileName) {
      ref.read(p.snippetFileProvider.notifier).closeActiveSnippet();
    }
  }

  Future<void> renameFile(String file, String newName) async {
    // 1. Obtener el estado actual
    final currentState = state.requireValue;
    final currentPath = currentState.currentPath;

    // Asegurarnos de que el nombre tenga la extensión correcta si tu app la requiere
    final String finalNewName = newName.endsWith(".code-snippets")
        ? newName
        : "$newName.code-snippets";

    if (state.requireValue.files.where((a) => a.name == newName).isNotEmpty) {
      return;
    }

    try {
      // 2. Renombrar físicamente en el sistema de archivos
      // Asumiendo que fs.renameFile existe, si no, se usa File(old).rename(new)
      final oldPath = '$currentPath/$file';
      final newPath = '$currentPath/$finalNewName';

      await File(oldPath).rename(newPath);

      // 3. Actualizar la lista de archivos en el estado local
      final updatedFiles = currentState.files.map((f) {
        if (f.name == file) {
          // Retornamos una copia del archivo con el nuevo nombre
          return SnippetFile(path: f.path, name: finalNewName);
        }
        return f;
      }).toList();

      state = AsyncValue.data(currentState.copyWith(files: updatedFiles));

      // 4. Si el archivo renombrado es el activo, actualizar el provider del snippet
      if (ref.read(p.snippetFileProvider)?.fileName == file) {
        ref
            .read(p.snippetFileProvider.notifier)
            .setActiveFile(currentPath, newName);
      }
    } catch (e) {
      // Opcional: Manejar el error (ej. permisos denegados)
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> moveSnippetToFile(String fileName, Snippet snippet) async {
    var currentPath = state.requireValue.currentPath;
    var files = state.requireValue.files;
    var filesFiltered = files.where((a) => a.name == fileName);
    var snippetsFile = filesFiltered.isEmpty
        ? []
        : await fs.getFileSnippets(filesFiltered.first);
    await fs.saveSnippetList(join(currentPath, fileName), [
      ...snippetsFile,
      snippet,
    ]);
    if (ref.read(p.snippetFileProvider)?.activeSnippet?.key == snippet.key) {
      ref.read(p.snippetFileProvider.notifier).closeActiveSnippet();
    }
    ref.read(p.snippetFileProvider.notifier).removeFromList(snippet.key);
    if (state.requireValue.files.where((a) => a.name == fileName).isEmpty)  {
      print("filename " + fileName);
      addNewFileToList(SnippetFile(name: fileName, path: currentPath));
    }
    ref.read(p.snippetFileProvider.notifier).saveSnippetList();
  }
}
