import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/snippet_file_state.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../business/models/SnippetFile.dart' as models_snippet_file;

part 'snippet_file.g.dart';

@riverpod
class SnippetFile extends _$SnippetFile {
  @override
  SnippetFileState? build() {
    return null;
  }

  setActiveFile (path, name) async {
    var snippets = await getFileSnippets(
      models_snippet_file.SnippetFile(path: path, name: name)
    );

    state = SnippetFileState(fileName: name, snippets: snippets);
  }

  setActiveSnippet (Snippet snippet) {
    if (state == null) return;
    state = state!.copyWith(activeSnippet: snippet);
  }

  setSaved(bool saved) {
    state = state!.copyWith(saved: false);
  }

}