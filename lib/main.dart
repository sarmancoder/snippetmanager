import 'package:aisnippets/HolyGrailLayout.dart';
import 'package:aisnippets/components/my_app_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() => runApp(ProviderScope(child: const MyApp()));

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AiSnippets',
      home: Scaffold(
        appBar: MyAppBar(),
        body: HolyGrailLayout(),
      ),
    );
  }
}