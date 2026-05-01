import 'dart:async';

import 'package:aisnippets/HolyGrailLayout.dart';
import 'package:aisnippets/components/my_app_bar.dart';
import 'package:aisnippets/config/theme.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:system_theme/system_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemTheme.accentColor.load();

  var prefs = await SharedPreferences.getInstance();
  final accentColor = SystemTheme.accentColor.accent;
  runApp(
    ProviderScope(
      overrides: [sharedPrefsProvider.overrideWithValue(prefs)],
      child: MyApp(color: accentColor),
    ),
  );
}

class MyApp extends ConsumerStatefulWidget {
  final Color color;

  const MyApp({super.key, required this.color});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _MyAppState();
}

class _MyAppState extends ConsumerState<MyApp> {
  late Color color;
  late StreamSubscription _subscription;

  @override
  void initState() {
    color = widget.color;
    _subscription = SystemTheme.onChange.listen((aaa){ 
      setState(() {
        color = aaa.accent;
      });
    });
    super.initState();
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var brightness = ref.watch(uiBrightnessProvider);
    return MaterialApp(
      theme: getTheme(color),
      darkTheme: getThemeDark(Color.lerp(color, Colors.black, 0.7)!),
      themeMode: brightness == Brightness.dark
          ? ThemeMode.dark
          : ThemeMode.light,
      debugShowCheckedModeBanner: false,
      title: 'AiSnippets',
      home: Scaffold(appBar: MyAppBar(), body: HolyGrailLayout()),
    );
  }
}
