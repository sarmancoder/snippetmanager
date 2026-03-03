// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'snippets.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(SnippetsFiles)
final snippetsFilesProvider = SnippetsFilesProvider._();

final class SnippetsFilesProvider
    extends $NotifierProvider<SnippetsFiles, List<SnippetFile>> {
  SnippetsFilesProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'snippetsFilesProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$snippetsFilesHash();

  @$internal
  @override
  SnippetsFiles create() => SnippetsFiles();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<SnippetFile> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<SnippetFile>>(value),
    );
  }
}

String _$snippetsFilesHash() => r'37a2341a2ce6185172c1ecee8d2397d67d8af526';

abstract class _$SnippetsFiles extends $Notifier<List<SnippetFile>> {
  List<SnippetFile> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<List<SnippetFile>, List<SnippetFile>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<List<SnippetFile>, List<SnippetFile>>,
              List<SnippetFile>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

@ProviderFor(ActiveSnippetFile)
final activeSnippetFileProvider = ActiveSnippetFileProvider._();

final class ActiveSnippetFileProvider
    extends $NotifierProvider<ActiveSnippetFile, String> {
  ActiveSnippetFileProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'activeSnippetFileProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$activeSnippetFileHash();

  @$internal
  @override
  ActiveSnippetFile create() => ActiveSnippetFile();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(String value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<String>(value),
    );
  }
}

String _$activeSnippetFileHash() => r'd6d3bbc51e028399478a28b49e3b8e0f71a76176';

abstract class _$ActiveSnippetFile extends $Notifier<String> {
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

@ProviderFor(SnippetList)
final snippetListProvider = SnippetListProvider._();

final class SnippetListProvider
    extends $NotifierProvider<SnippetList, List<Snippet>> {
  SnippetListProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'snippetListProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$snippetListHash();

  @$internal
  @override
  SnippetList create() => SnippetList();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<Snippet> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<Snippet>>(value),
    );
  }
}

String _$snippetListHash() => r'a1f65c4025477dabc80a54cbe55fc19cdc024309';

abstract class _$SnippetList extends $Notifier<List<Snippet>> {
  List<Snippet> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<List<Snippet>, List<Snippet>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<List<Snippet>, List<Snippet>>,
              List<Snippet>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

@ProviderFor(ActiveSnippet)
final activeSnippetProvider = ActiveSnippetProvider._();

final class ActiveSnippetProvider
    extends $NotifierProvider<ActiveSnippet, Snippet?> {
  ActiveSnippetProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'activeSnippetProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$activeSnippetHash();

  @$internal
  @override
  ActiveSnippet create() => ActiveSnippet();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Snippet? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Snippet?>(value),
    );
  }
}

String _$activeSnippetHash() => r'2b2413f2a8780b9c25446617a20f96cba09b0460';

abstract class _$ActiveSnippet extends $Notifier<Snippet?> {
  Snippet? build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<Snippet?, Snippet?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<Snippet?, Snippet?>,
              Snippet?,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

@ProviderFor(Saved)
final savedProvider = SavedProvider._();

final class SavedProvider extends $NotifierProvider<Saved, bool> {
  SavedProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'savedProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$savedHash();

  @$internal
  @override
  Saved create() => Saved();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(bool value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<bool>(value),
    );
  }
}

String _$savedHash() => r'9778df1b0b13bdccfe5f59c8ffd09c1af6323ed2';

abstract class _$Saved extends $Notifier<bool> {
  bool build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<bool, bool>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<bool, bool>,
              bool,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
