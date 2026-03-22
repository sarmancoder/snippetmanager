import 'package:aisnippets/HolyGrailLayout.dart';
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AiSnippets',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('AiSnippets'),
        ),
        body: HolyGrailLayout(),
      ),
    );
  }
}