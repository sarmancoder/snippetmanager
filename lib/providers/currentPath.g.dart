// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'currentPath.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(CurrentPath)
final currentPathProvider = CurrentPathProvider._();

final class CurrentPathProvider extends $NotifierProvider<CurrentPath, String> {
  CurrentPathProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'currentPathProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$currentPathHash();

  @$internal
  @override
  CurrentPath create() => CurrentPath();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(String value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<String>(value),
    );
  }
}

String _$currentPathHash() => r'7c9c2405a8fabd97434de9c0bde4f325db24bde6';

abstract class _$CurrentPath extends $Notifier<String> {
  String build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<String, String>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<String, String>,
              String,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
