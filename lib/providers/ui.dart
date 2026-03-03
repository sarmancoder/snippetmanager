import 'package:aisnippets/config/app.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'ui.g.dart';

@riverpod
class DarkMode extends _$DarkMode {
  @override
  bool build() {
    // Leemos el valor de forma síncrona desde el otro provider
    final prefs = ref.watch(sharedPrefsProvider);
    return prefs.getBool(SharedPrefsValues.darkMode) ?? false;
  }

  Future<void> toggle() async {
    state = !state;
    await ref.read(sharedPrefsProvider).setBool(SharedPrefsValues.darkMode, state);
  }
}

@riverpod
SharedPrefs (Ref ref) {
  throw UnimplementedError(); // Se sobrescribirá en el main
}
