import 'package:aisnippets/config/app.dart';
import 'package:flutter/widgets.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'ui.g.dart';

@riverpod
SharedPreferences SharedPrefs (Ref ref) {
  throw UnimplementedError(); // Se sobrescribirá en el main
}

@riverpod
class UiBrightness extends _$UiBrightness {
  @override
  Brightness build() {
    // Aquí puedes poner tu lógica inicial (por ejemplo, leer de SharedPreferences)
    var darkMode = ref.read(sharedPrefsProvider).getBool(SharedPrefsValues.darkMode);
    return darkMode != null && darkMode == true ? Brightness.dark : Brightness.light;
  }

  void toggle() {
    state = (state == Brightness.light) ? Brightness.dark : Brightness.light;
    ref.read(sharedPrefsProvider).setBool(SharedPrefsValues.darkMode, state == Brightness.dark);
  }
}