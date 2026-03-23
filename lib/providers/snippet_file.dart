import 'package:aisnippets/business/fs.dart' as fs;
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/snippet_file_state.dart';
import 'package:aisnippets/providers/directory_provider.dart';
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

  setActiveFile (path, name) async {
    var snippets = await fs.getFileSnippets(
      models_snippet_file.SnippetFile(path: path, name: name)
    );

    state = SnippetFileState(fileName: name, snippets: snippets);
  }

  setActiveSnippet (Snippet snippet) {
    if (state == null) return;
    state = state!.copyWith(activeSnippet: snippet, editingSnippet: null);
  }

  setEditingSnippet(Snippet editingSnippet) {
    state = state!.copyWith(saved: false, editingSnippet: editingSnippet);
  }

  saveSnippetList() async {
    var news = [
      for (final s in state!.snippets)
        if (s.key == state!.editingSnippet!.key) state!.editingSnippet! else s,
    ];
    var currentPath = ref.read(directoryProviderProvider).requireValue.currentPath;
    var pathFile = p.join(currentPath, state!.fileName);
    await fs.saveSnippetList(pathFile, news);
    state = state!.copyWith(saved: true);
  }

}