import 'dart:convert';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:aisnippets/providers/web_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
/*
class SnippetsWebPage extends ConsumerWidget {
  const SnippetsWebPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var active = ref.watch(
      snippetFileProvider.select((a) => a?.activeSnippet)
    );

    ref.listen(
      snippetFileProvider.select((a) => a?.activeSnippet),
      (old, curr) async {
        if (curr == null) {
          ref.read(webPageProvider.notifier).close();
          return;
        }
        do {
          var result = ref.read(webPageProvider.notifier).sendSnippet(curr);
          if (result) break;
          else {
            await Future.delayed(Duration(milliseconds: 500));
          }
        } while (true);
      }
    );

    return Column(
      children: <Widget>[
        Expanded(
          flex: 1,
          child: active == null ? Container() : InAppWebView(
            initialUrlRequest: URLRequest(
              url: WebUri(snippetsWebEditorAddress),
            ),
          
            onWebViewCreated: (controller) {
              /*_webViewController = controller;
              debugPrint('WebView creado');
          
              controller.addJavaScriptHandler(
                handlerName: 'updateSnippet',
                callback: (args) {
                  // Actualizar snippet
                },
              );*/
            },
          
            /*onConsoleMessage: (controller, consoleMessage) {
                print("JS Console: ${consoleMessage.message}");
              },*/
            onLoadStop: (controller, url) async {
              ref.read(webPageProvider.notifier).setController(controller);
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
      ],
    );
  }
}*/

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
    ref.listen(snippetFileProvider.select((a) => a?.activeSnippet), (
      old,
      curr,
    ) async {
      if (curr == null) return;
      _dispatchCustomEvent('insertSnippet', {
        "prefix": curr.prefix,
        "description": curr.description,
        "body": curr.body.split('\n'),
        "scope": curr.scope,
      });
    });

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
