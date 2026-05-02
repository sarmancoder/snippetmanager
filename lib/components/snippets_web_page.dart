import 'dart:convert';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_all/webview_all.dart';

class SnippetsWebPage extends ConsumerStatefulWidget {
  const SnippetsWebPage({super.key});

  @override
  ConsumerState<SnippetsWebPage> createState() => _SnippetsWebPageState();
}

class _SnippetsWebPageState extends ConsumerState<SnippetsWebPage> {
  WebViewController? _controller;
  bool firstLoaded = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..loadRequest(Uri.parse(snippetsWebEditorAddress));
  }

  Future<void> _dispatchCustomEvent(
    String eventName,
    Map<String, dynamic> detail,
  ) async {
    if (_controller == null) return;
    final jsonDetail = jsonEncode(detail);
    final jsCode = """
      window.dispatchEvent(new CustomEvent("$eventName", {
        detail: $jsonDetail,
        bubbles: true,
        cancelable: true
      }));
    """;
    
    try {
      await _controller!.runJavaScript(jsCode);
    } catch (e) {
      debugPrint("Error JS: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var active = ref.watch(snippetFileProvider.select((a) => a?.activeSnippet));

    // Listeners para sincronización
    ref.listen(snippetFileProvider.select((a) => a?.activeSnippet), (old, curr) {
      if (curr == null) return;
      _dispatchCustomEvent('insertSnippet', {
        "prefix": curr.prefix,
        "description": curr.description,
        "body": curr.body.split('\n'),
        "scope": curr.scope,
      });
    });

    ref.listen(uiBrightnessProvider, (old, curr) {
      _dispatchCustomEvent('toggleDark', {
        'dark': curr == Brightness.dark ? 1 : 0,
      });
    });

    print(active);

    return IndexedStack(
      index: 1,
      children: [
        const Center(child: Text("No hay snippet abierto")),
        WebViewWidget(
          controller: _controller!,
          /*url: snippetsWebEditorAddress,
          onWebviewCreated: (controller) {
            _controller = controller;
          },
          // Comunicación JS -> Flutter
          javascriptChannels: {
            JavascriptChannel(
              name: 'updateSnippetChannel',
              onMessageReceived: (JavascriptMessage message) {
                final currentActive = ref.read(snippetFileProvider)?.activeSnippet;
                if (currentActive == null) return;

                var newSnippet = jsonDecode(message.message);
                var snippet = Snippet(
                  prefix: newSnippet['prefix'] ?? '',
                  description: newSnippet['description'] ?? '',
                  body: (newSnippet['body'] is List
                      ? newSnippet['body'].join('\n')
                      : newSnippet['body'] ?? ''),
                  key: currentActive.key,
                  scope: newSnippet['scope'] ?? '',
                );

                if (!snippet.equals(currentActive)) {
                  ref.read(snippetFileProvider.notifier).setEditingSnippet(snippet);
                }
              },
            ),
          },*/
        ),
      ],
    );
  }
}