import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_state.freezed.dart';

@freezed
abstract class AppState with _$AppState {
  const factory AppState({
    required String currentPath,
    required List<SnippetFile> files
  }) = _AppState;
}
