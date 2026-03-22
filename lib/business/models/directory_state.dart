import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'directory_state.freezed.dart';

@freezed
abstract class DirectoryState with _$DirectoryState {
  const factory DirectoryState({
    required String currentPath,
    required List<SnippetFile> files
  }) = _DirectoryState;
}
