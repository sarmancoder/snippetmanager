import 'package:flutter/material.dart';

var getFromSeed = (Brightness b) =>
    ColorScheme.fromSeed(seedColor: Colors.purple, brightness: b);

var theme = (bool darkMode) {
  var brightness = darkMode ? Brightness.dark : Brightness.light;
  var fromSeed = getFromSeed(brightness);
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    iconButtonTheme: IconButtonThemeData(
      style: IconButton.styleFrom(enabledMouseCursor: SystemMouseCursors.click),
    ),
    colorScheme: fromSeed,
    appBarTheme: AppBarThemeData(
      backgroundColor: fromSeed.primary,
      foregroundColor: fromSeed.onPrimary,
    ),
  );
};
