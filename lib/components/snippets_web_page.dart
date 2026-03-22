import 'dart:convert';
import 'package:aisnippets/config/app.dart';
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
    return Column(
      children: [
        Expanded(
          child: Container(
            margin: EdgeInsets.only(left: 10),
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
                    // Actualizar snippet
                  },
                );
              },
            
              /*onConsoleMessage: (controller, consoleMessage) {
                  print("JS Console: ${consoleMessage.message}");
                },*/
              onLoadStop: (controller, url) async {
                // Insertar snippet con retardo
              },
            
              initialSettings: InAppWebViewSettings(
                underPageBackgroundColor: const Color(0x00000000),
                forceDark: ForceDark.AUTO,
                javaScriptEnabled: true,
                useHybridComposition: true,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
