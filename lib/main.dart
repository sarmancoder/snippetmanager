import 'package:aisnippets/business/fs.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/currentPath.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:json5/json5.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'config/theme.dart';
import 'home_page.dart';
import 'package:flutter/material.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  var prefs = await SharedPreferences.getInstance();
  var path = getVSCodePath();
  var filesList = await loadDirectory(path);
  var list = await getFileSnippets(filesList[1]);
  print("cantidad de snippets " + list.length.toString());
  runApp(ProviderScope(
    overrides: [
      sharedPrefsProvider.overrideWithValue(prefs),
      snippetsFilesProvider.overrideWith(() => SnippetsFiles(filesList)),
      activeSnippetFileProvider.overrideWith(() => ActiveSnippetFile(filesList[1].name)),
      currentPathProvider.overrideWith(() => CurrentPath(path)),
      snippetListProvider.overrideWith(() => SnippetList(list))
    ],
    child: const MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var dark = ref.watch(darkModeProvider);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Material App',
      theme: theme(dark),
      home: HomePage(),
    );
  }
}
