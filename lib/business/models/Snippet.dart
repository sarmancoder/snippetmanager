import 'package:json5/json5.dart';

class Snippet {

  final String key;
  final String prefix;
  final String description;
  final String body;
  final String scope;
  final bool insertSnippet;
  // final String comments;

  Snippet({
    this.insertSnippet = true,
    required this.prefix,
    required this.description, 
    required this.body,
    required this.key,
    required this.scope
  });

  /*static Snippet fromContentFile(String fileContent) async {
    var json = JSON5.parse(fileContent);
  }*/
  
  bool equals(Snippet snippet) {
    return snippet.body == body && snippet.prefix == prefix && snippet.description == description;
  }

  bool isEmpty() {
    return body.isEmpty && prefix.isEmpty && description.isEmpty;
  }

}