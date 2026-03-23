import 'package:aisnippets/business/models/Snippet.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'snippet_file_state.freezed.dart';

@freezed
abstract class SnippetFileState with _$SnippetFileState {
  const factory SnippetFileState({
    required String fileName,
    required List<Snippet> snippets
  }) = _SnippetFileState;
}
