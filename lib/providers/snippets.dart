import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'snippets.g.dart';

@riverpod
class SnippetsFiles extends _$SnippetsFiles {
  List<SnippetFile> snippetFiles;

  SnippetsFiles([this.snippetFiles = const []]);

  @override
  List<SnippetFile> build() {
    return snippetFiles;
  }
}

@riverpod
class ActiveSnippetFile extends _$ActiveSnippetFile {
  final String initialValue;

  ActiveSnippetFile([this.initialValue = ""]);

  @override
  String build() {
    return initialValue;
  }

  setActiveSnippet(String fileName) {
    state = fileName;
  }
}

@riverpod
class SnippetList extends _$SnippetList {
  List<Snippet> initialList;

  SnippetList([this.initialList = const []]);

  @override
  List<Snippet> build() {
    return initialList;
  }

  updateSnippet(Snippet snippet) {
    var news = [
      for (final s in state)
        if (s.key == snippet.key) snippet else s
    ];
    state = news;
    return news;
  }

  setList(List<Snippet> list) {
    state = list;
  }
}

@riverpod
class ActiveSnippet extends _$ActiveSnippet {
  @override
  Snippet? build() {
    return null;
  }

  setActiveSnippet (Snippet snippet) {
    state = snippet;
  }
}

@riverpod
class Saved extends _$Saved {
  @override
  bool build() {
    return true;
  }

  setSaved (bool saved) {
    state = saved;
  }
}

