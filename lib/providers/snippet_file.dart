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

  setActiveSnippet(Snippet snippet) {
    if (state == null) return;
    state = state!.copyWith(activeSnippet: snippet.copyWith(), editingSnippet: snippet.copyWith());
  }

  setEditingSnippet(Snippet editingSnippet) {
    state = state!.copyWith(saved: false, editingSnippet: editingSnippet.copyWith());
  }

  updateSnippet() {
    List<Snippet> news = [];
    bool replaced = false;
    for (final s in state!.snippets) {
      if (!replaced && s.key == state!.editingSnippet!.key) {
        news.add(state!.editingSnippet!);
        replaced = true;
      } else {
        news.add(s);
      }
    }
    state = state!.copyWith(snippets: news);
    return news;
  }

  saveSnippetList() async {
    print("activesnippet:");
    print(state!.activeSnippet);
    var currentPath = ref
        .read(directoryProviderProvider)
        .requireValue
        .currentPath;
    var currentFile = state!.fileName;
    var currentSnippet = state!.activeSnippet;
    var snippets = [];
    if (currentSnippet != null) {
      snippets = updateSnippet();
    }
    var file = p.join(currentPath, currentFile);
    print("Listado de snippets");
    print(snippets);
    print("Listado de snippets");
    await fs.saveSnippetList(file, snippets as dynamic);
    state = state!.copyWith(saved: true);
  }
}
