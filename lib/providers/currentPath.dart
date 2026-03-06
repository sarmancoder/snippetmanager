import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'currentPath.g.dart';

@riverpod
class CurrentPath extends _$CurrentPath {
  String initialSnippetsPath;

  CurrentPath([this.initialSnippetsPath = ""]);

  @override
  String build() {
    return initialSnippetsPath;
  }

  setPath(String path) {
    state = path;
  }
}