import 'dart:convert';
import 'dart:io';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/business/models/SnippetFile.dart';
import 'package:json5/json5.dart';
import 'package:path/path.dart' as p;

String getVSCodePath() {
  String roamingPath = Platform.environment['APPDATA']!;
  String vscodeSnippetsPath = p.join(roamingPath, "Code", "User", "snippets");
  return vscodeSnippetsPath;
}

Future<List<SnippetFile>> loadDirectory(String path) async {
  List<SnippetFile> files = [];

  final dir = Directory(p.join(path)); // Ejemplo con una carpeta real

  if (await dir.exists()) {
    await for (FileSystemEntity entity in dir.list(recursive: false)) {
      if (entity is File && entity.path.endsWith("json")) {
        files.add(SnippetFile(path: path, name: p.basename(entity.path)));
      }
    }
  }

  return files;
}

Future<List<Snippet>> getFileSnippets(SnippetFile file) async {
  var snippets = <Snippet>[];
  var fileStr = p.join(file.path, file.name);
  String contenido = await File(fileStr).readAsString();
  var json = JSON5.parse(contenido);
  for (var entry in json.entries) {
    var key = entry.key;
    var value = entry.value;
    snippets.add(
      Snippet(
        key: key,
        prefix: value['prefix'],
        scope: value['scope'] ?? "",
        description: value['description'],
        body: value['body'].join('\n'),
      ),
    );
  }
  return snippets;
}

Future saveSnippetList(String pathFile, List<Snippet> list) async {
  var snippets = {};
  for (var i = 0; i < list.length; i++) {
    var currSnip = list[i];
    snippets[currSnip.key] = {
      "prefix": currSnip.prefix,
      "description": currSnip.description,
      "body": currSnip.body.split("\n"),
    };
    if (currSnip.key.isNotEmpty) {
      snippets[currSnip.key]['scope'] = currSnip.scope;
    }
  }
  var encoder = const JsonEncoder.withIndent('  '); // Dos espacios de sangría
  String prettyprint = encoder.convert(snippets);
  await File(pathFile).writeAsString(prettyprint);
}
