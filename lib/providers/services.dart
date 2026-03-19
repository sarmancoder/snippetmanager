import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/providers/currentPath.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:path/path.dart' as p;

part 'services.g.dart';

@riverpod
class Services extends _$Services {
  @override
  void build() {
    return;
  }

  saveCurrentSnippet() async {
    var aa = ref.keepAlive();

    try { 
      var currentPath = ref.read(currentPathProvider);
      var currentFile = ref.read(activeSnippetFileProvider);
      var currentSnippet = ref.read(activeSnippetProvider);
      var state = ref.read(snippetListProvider);
      if (currentSnippet != null) {
        state = ref
            .read(snippetListProvider.notifier)
            .updateSnippet(
              Snippet(
                prefix: currentSnippet.prefix,
                description: currentSnippet.description,
                body: currentSnippet.body,
                scope: currentSnippet.scope,
                key: currentSnippet.key,
              ),
            );
      }
      var file = p.join(currentPath, currentFile);
      await saveSnippetList(file, state);
      ref.read(savedProvider.notifier).setSaved(true);
    } catch (exception) {
      print(exception);
    } finally {
      aa.close();
    }
  }

  createNewFile(String fileName, String content) async {
    var currentPath = ref.read(currentPathProvider);
    await createNewSnippetFile(currentPath, fileName, content);
  }
}
