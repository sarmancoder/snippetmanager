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
    print("controller");
    if (_webViewController == null) return;

    print("json encode");
    // Convierte el mapa Dart a JSON string válido
    final jsonDetail = jsonEncode(detail);

    print('enviando javascript ' + eventName);

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
      });
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
                    scope: snippet['scope'],
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
              await Future.delayed(Duration(milliseconds: 100));
              _dispatchCustomEvent('insertSnippet', {
                "prefix": c.prefix,
                "description": c.description,
                "body": c.body.split('\n'),
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
