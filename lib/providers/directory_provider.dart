import 'dart:io';

import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:aisnippets/business/models/directory_state.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:url_launcher/url_launcher.dart';

part 'directory_provider.g.dart';

@riverpod
class DirectoryProvider extends _$DirectoryProvider {
  @override
  FutureOr<DirectoryState> build() async {
    var path = getVSCodePath();
    return await _loadDirectory(path);
  }

  _loadDirectory(path) async {
    var files = await loadDirectory(path);
    var appState = DirectoryState(currentPath: path, files: files);
    return appState;
  }

  changeDirtory(path) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return await _loadDirectory(path);
    });
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
    await createNewSnippetFile(currentPath, fileName, content);
    var files = state.requireValue.files;
    var newFile = SnippetFile(path: currentPath, name: fileName + ".code-snippets");
    state = AsyncValue.data(state.requireValue.copyWith(files: [...files, newFile]));
  }
}
