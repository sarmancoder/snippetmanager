import 'dart:convert';

import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/snippets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SnippetsWebPage extends ConsumerStatefulWidget {
  const SnippetsWebPage({super.key});

  @override
  ConsumerState<SnippetsWebPage> createState() => _SnippetsWebPageState();
}

class _SnippetsWebPageState extends ConsumerState<SnippetsWebPage> {
  InAppWebViewController? _webViewController; // ← Aquí guardamos el controller
  bool firstLoaded = false;

  Future<void> _dispatchCustomEvent(
    String eventName,
    Map<String, dynamic> detail,
  ) async {
    if (_webViewController == null) return;
    final jsonDetail = jsonEncode(detail);
    await _webViewController!.evaluateJavascript(
      source:
          """
    window.dispatchEvent(new CustomEvent("$eventName", {
      detail: $jsonDetail,   // Ahora es un JSON válido: {"action":"save","data":{"title":"Mi snippet","code":"print(\"hola\")"}}
      bubbles: true,
      cancelable: true
    }));
  """,
    );
  }

  @override
  Widget build(BuildContext context) {
    var activeSnippet = ref.watch(activeSnippetProvider);
    ref.listen(activeSnippetProvider, (context, c) {
      if (!firstLoaded) return;
      if (c == null || !c.insertSnippet) return;
      _dispatchCustomEvent('insertSnippet', {
        "prefix": c.prefix,
        "description": c.description,
        "body": c.body.split('\n'),
        "scope": c.scope
      });
    });
    ref.listen(activeSnippetProvider, (b, c) {
      if (b == null || c == null) return;
      if (b.key != c.key) return;
      if (b.scope != c.scope) ref.read(savedProvider.notifier).setSaved(false);
    });

    return Column(
      children: [
        Expanded(
          child: InAppWebView(
            initialUrlRequest: URLRequest(
              url: WebUri(snippetsWebEditorAddress),
            ),

            onWebViewCreated: (controller) {
              _webViewController = controller;
              debugPrint('WebView creado');

              controller.addJavaScriptHandler(
                handlerName: 'updateSnippet',
                callback: (args) {
                  print("updating");
                  var snippet = jsonDecode(args[0]);
                  var currentSnippet = ref.read(activeSnippetProvider);
                  if (currentSnippet == null) return;
                  var newSnippet = Snippet(
                    prefix: snippet['prefix'],
                    scope: snippet['scope'] ?? "",
                    description: snippet['description'],
                    body: snippet['body'].join('\n'),
                    key: currentSnippet.key,
                    insertSnippet: false,
                  );
                  ref
                      .read(activeSnippetProvider.notifier)
                      .setActiveSnippet(newSnippet);
                },
              );
            },

            /*onConsoleMessage: (controller, consoleMessage) {
                print("JS Console: ${consoleMessage.message}");
              },*/
            onLoadStop: (controller, url) async {
              var c = activeSnippet;
              if (c == null || !c.insertSnippet) return;
              await Future.delayed(Duration(milliseconds: 200));
              _dispatchCustomEvent('insertSnippet', {
                "prefix": c.prefix,
                "description": c.description,
                "body": c.body.split('\n'),
                "scope": c.scope
              });
              setState(() {
                firstLoaded = true;
              });
            },

            initialSettings: InAppWebViewSettings(
              underPageBackgroundColor: const Color(0x00000000),
              forceDark: ForceDark.AUTO,
              javaScriptEnabled: true,
              useHybridComposition: true,
            ),
          ),
        ),
      ],
    );
  }
}
