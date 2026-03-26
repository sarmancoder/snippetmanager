import 'package:aisnippets/HolyGrailLayout.dart';
import 'package:aisnippets/components/my_app_bar.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  var prefs = await SharedPreferences.getInstance();
  runApp(ProviderScope(
    overrides: [
      sharedPrefsProvider.overrideWithValue(prefs),
    ],
    child: const MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var brighness = ref.watch(uiBrightnessProvider);
    return MaterialApp(
      theme: ThemeData(
        brightness: brighness
      ),
      debugShowCheckedModeBanner: false,
      title: 'AiSnippets',
      home: Scaffold(
        appBar: MyAppBar(),
        body: HolyGrailLayout(),
      ),
    );
  }
}