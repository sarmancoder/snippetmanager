import 'dart:io';

import 'package:aisnippets/business/fs.dart' as fs;
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:aisnippets/business/models/directory_state.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/snippet_file.dart' as p;
import 'package:aisnippets/providers/ui.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:url_launcher/url_launcher.dart';

part 'directory_provider.g.dart';

@riverpod
class DirectoryProvider extends _$DirectoryProvider {
  @override
  FutureOr<DirectoryState> build() async {
    var lastDir = ref.read(sharedPrefsProvider).getString(SharedPrefsValues.lastDirKey);
    var path = lastDir ?? fs.getVSCodePath();
    return await _loadDirectory(path);
  }

  _loadDirectory(path) async {
    var files = await fs.loadDirectory(path);
    var appState = DirectoryState(currentPath: path, files: files);
    return appState;
  }

  changeDirtory(path) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return await _loadDirectory(path);
    });
    await ref.read(sharedPrefsProvider).setString(SharedPrefsValues.lastDirKey, path);
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
    var newFile = SnippetFile(path: currentPath, name: fileName + ".code-snippets");
    // state = AsyncValue.data(state.requireValue.copyWith(files: [...files, newFile]));
    addNewFileToList(newFile);
  }
  
  addNewFileToList(SnippetFile newFile) {
    var files = state.requireValue.files;
    state = AsyncValue.data(state.requireValue.copyWith(files: [...files, newFile]));
  }

  deleteFile(String fileName) async {
    await fs.deleteFile(state.requireValue.currentPath, fileName);
    var s = state.requireValue;
    state = AsyncValue.data(s.copyWith(
      files: [...s.files].where((f) => f.name != fileName).toList()
    ));
    var snippetFile = ref.read(p.snippetFileProvider);
    if (fileName == snippetFile?.fileName) {
      ref.read(p.snippetFileProvider.notifier).closeActiveSnippet();
    }
  }
}
