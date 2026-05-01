import 'package:flutter/material.dart';
import 'package:flutter_tailwind_colors/flutter_tailwind_colors.dart';
import 'package:system_theme/system_theme.dart';

var redColor = TWColors.red[600];
var greenColor = TWColors.green[600];

/*var bgcolor = TWColors.slate;
var primaryColor = TWColors.indigo;*/

buttonColorStyle(Set<WidgetState> state, Color color) {
  if (state.contains(WidgetState.hovered) && !state.contains(WidgetState.disabled)) {
    return color;
  }
  return color.withAlpha(200);
}

ThemeData baseTheme(ThemeData t) {
  var isDark = t.brightness == Brightness.dark;
  var fgColorText = isDark ? Colors.white : Colors.black;

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
    backgroundColor: WidgetStateProperty.resolveWith((a) {
      if (a.contains(WidgetState.disabled)) {
        return Colors.grey[isDark ? 800 : 400];
      }
      return t.primaryColorDark;
    }),
    // .resolveWith((a) => buttonColorStyle(a, t.primaryColorDark)),
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

ThemeData getTheme(Color accentColor) {
  return baseTheme(
    ThemeData(
      brightness: Brightness.light,
      primaryColor: accentColor,
      primaryColorDark: accentColor,
    ),
  ).copyWith(
    appBarTheme: AppBarTheme(backgroundColor: accentColor, foregroundColor: Colors.grey[200],),
    drawerTheme: DrawerThemeData(backgroundColor: accentColor.withAlpha(10)),
  );
}

ThemeData getThemeDark(Color accentColor) {
  return baseTheme(
    ThemeData(
      brightness: Brightness.dark,
      primaryColor: accentColor,
      primaryColorDark: accentColor,
    ),
  ).copyWith(
    appBarTheme: AppBarTheme(backgroundColor: accentColor),
    drawerTheme: DrawerThemeData(backgroundColor: accentColor!.withAlpha(50)),
  );
}
