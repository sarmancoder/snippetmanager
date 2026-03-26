import 'package:flutter/material.dart';
import 'package:flutter_tailwind_colors/flutter_tailwind_colors.dart';

var redColor = TWColors.red[600];
var greenColor = TWColors.green[600];

var bgcolor = TWColors.slate;
var primaryColor = TWColors.indigo;

buttonColorStyle(Set<WidgetState> state, Color color) {
  if (state.contains(WidgetState.hovered) && !state.contains(WidgetState.disabled)) {
    return color;
  }
  return color.withAlpha(200);
}

ThemeData baseTheme(ThemeData t) {
  var fgColorText = t.brightness == Brightness.dark ? Colors.white : Colors.black;
  var bs = ButtonStyle(
    shape: WidgetStatePropertyAll(
      RoundedRectangleBorder(borderRadius: BorderRadiusGeometry.circular(5)),
    ),
    elevation: WidgetStatePropertyAll(0),
    mouseCursor: WidgetStateProperty.resolveWith((a) {
      if (a.contains(WidgetState.disabled)) {
        return SystemMouseCursors.basic;
      }
      return SystemMouseCursors.click;
    }),
    shadowColor: const WidgetStatePropertyAll(Colors.transparent),
    backgroundColor: WidgetStateProperty.resolveWith((a) => buttonColorStyle(a, t.primaryColorDark)),
    foregroundColor: WidgetStatePropertyAll(Colors.white),
  );
  return ThemeData(
    brightness: t.brightness,
    primaryColor: t.primaryColor,
    iconButtonTheme: IconButtonThemeData(
      style: bs.copyWith(
        backgroundColor: WidgetStatePropertyAll(Colors.transparent),
        foregroundColor: WidgetStateProperty.resolveWith((a) => buttonColorStyle(a, fgColorText)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(style: bs),
  );
}

ThemeData getTheme() {
  var bgColorTone = 400;
  var matColor = primaryColor;
  return baseTheme(
    ThemeData(
      brightness: Brightness.light,
      primaryColor: matColor[bgColorTone - 100],
      primaryColorDark: matColor[bgColorTone + 200],
    ),
  ).copyWith(
    appBarTheme: AppBarTheme(backgroundColor: bgcolor[bgColorTone]),
    drawerTheme: DrawerThemeData(backgroundColor: bgcolor[bgColorTone - 200]),
  );
}

ThemeData getThemeDark() {
  var bgColorTone = 900;
  var matColor = primaryColor;
  return baseTheme(
    ThemeData(
      brightness: Brightness.dark,
      primaryColor: matColor[bgColorTone - 200],
      primaryColorDark: matColor[bgColorTone - 300],
    ),
  ).copyWith(
    appBarTheme: AppBarTheme(backgroundColor: bgcolor[bgColorTone]),
    drawerTheme: DrawerThemeData(backgroundColor: bgcolor[bgColorTone - 200]),
  );
}
