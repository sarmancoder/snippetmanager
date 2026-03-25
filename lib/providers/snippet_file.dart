import 'package:aisnippets/business/fs.dart' as fs;
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/snippet_file_state.dart';
import 'package:aisnippets/dialogs/confirm.dart';
import 'package:aisnippets/providers/directory_provider.dart';
import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../business/models/SnippetFile.dart' as models_snippet_file;
import 'package:path/path.dart' as p;

part 'snippet_file.g.dart';

@riverpod
class SnippetFile extends _$SnippetFile {
  @override
  SnippetFileState? build() {
    return null;
  }

  setActiveFile(path, name) async {
    var snippets = await fs.getFileSnippets(
      models_snippet_file.SnippetFile(path: path, name: name),
    );

    state = SnippetFileState(
      fileName: name,
      activeSnippet: null,
      editingSnippet: null,
      snippets: snippets,
    );
  }

  setActiveSnippetByKey(String key) {
    final snippetIndex = state!.snippets.indexWhere((s) => s.key == key);
    if (snippetIndex == -1) return;

    final snippet = state!.snippets[snippetIndex];
    state = state!.copyWith(
      activeSnippet: snippet,
      editingSnippet: snippet.copyWith(),
      saved: true,
    );
  }

  setEditingSnippet(Snippet editingSnippet) {
    state = state!.copyWith(
      saved: false,
      editingSnippet: editingSnippet.copyWith(),
    );
  }

  updateSnippet() {
    if (state!.editingSnippet == null) return state!.snippets;
    final updatedSnippets = state!.snippets.map((s) {
      if (s.key == state!.editingSnippet!.key) {
        return state!.editingSnippet!;
      }
      return s;
    }).toList();
    return updatedSnippets;
  }

  saveSnippetList() async {
    var currentPath = ref
        .read(directoryProviderProvider)
        .requireValue
        .currentPath;
    var currentFile = state!.fileName;
    var updatedSnippets = updateSnippet();
    var file = p.join(currentPath, currentFile);
    await fs.saveSnippetList(file, updatedSnippets as dynamic);

    // Sincronizar y marcar como guardado
    state = state!.copyWith(
      snippets: updatedSnippets,
      activeSnippet: state!.editingSnippet,
      saved: true,
    );
  }

  askForSave(BuildContext context) async {
    var active = state;
    if (active == null) return true;
    var saved = active.saved;
    var activeSnippet = active.activeSnippet;

    if (!saved && activeSnippet != null) {
      var confirmed = await confirm(
        context: context,
        content: const Text(
          '¿Seguro que quieres salir? Los cambios no guardados se perderan',
        ),
      );
      if (!confirmed) return false;
      await saveSnippetList();
      await Future.delayed(Duration(milliseconds: 150));
      return true;
    }
    return true;
  }
}
