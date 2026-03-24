import 'dart:convert';

import 'package:freezed_annotation/freezed_annotation.dart';

part 'Snippet.freezed.dart';

@freezed
abstract class Snippet with _$Snippet {
  const factory Snippet({
    required String key,
    required String prefix,
    required String description,
    required String body,
    required String scope,
    @Default(true) bool insertSnippet,
  }) = _Snippet;

  @override
  String toString() {
    const JsonEncoder encoder = JsonEncoder.withIndent(
      '  ',
    ); // Dos espacios de sangría
    return encoder.convert({
      'prefix': prefix,
      'description': description,
      'body': body,
      'scope': scope,
    });
  }
}

extension Methods on Snippet {

  bool equals(Snippet snippet) {
    return snippet.body == body &&
        snippet.prefix == prefix &&
        snippet.description == description &&
        snippet.scope == scope;
  }

  bool isEmpty() {
    return body.isEmpty && prefix.isEmpty && description.isEmpty;
  }

}
