import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'ui.g.dart';

@riverpod
SharedPreferences SharedPrefs (Ref ref) {
  throw UnimplementedError(); // Se sobrescribirá en el main
}
