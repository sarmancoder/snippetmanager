import 'dart:convert';
import 'package:aisnippets/business/models/Snippet.dart';
import 'package:aisnippets/config/app.dart';
import 'package:aisnippets/providers/snippet_file.dart';
import 'package:aisnippets/providers/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
    try {
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
    } on MissingPluginException {
    } catch (exception) {
      print(exception.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    var active = ref.watch(snippetFileProvider.select((a) => a?.activeSnippet));
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

    ref.listen(uiBrightnessProvider, (old, curr) {
      _dispatchCustomEvent('toggleDark', {
        'dark': curr == Brightness.dark ? 1 : 0,
      });
    });

    return IndexedStack(
      index: active != null ? 1 : 0,
      children: [
        Center(
          child: Text(
            "No hay ningún snippet abierto actualmente",
            style: theme.textTheme.headlineLarge,
          ),
        ),
        InAppWebView(
          initialUrlRequest: URLRequest(
            url: WebUri(snippetsWebEditorAddress),
          ),
            
          onWebViewCreated: (controller) {
            _webViewController = controller;
            debugPrint('WebView creado');
            
            controller.addJavaScriptHandler(
              handlerName: 'updateSnippet',
              callback: (args) {
                // Obtener siempre el estado actual, no usar la referencia capturada
                final currentState = ref.read(snippetFileProvider);
                final currentActive = currentState?.activeSnippet;
            
                if (currentActive == null) return;
            
                var newSnippet = jsonDecode(args[0]);
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
                  ref
                      .read(snippetFileProvider.notifier)
                      .setEditingSnippet(snippet);
                }
              },
            );
          },
            
          /*onConsoleMessage: (controller, consoleMessage) {
              print("JS Console: ${consoleMessage.message}");
            },*/
          onLoadStop: (controller, url) async {
            // Insertar snippet con retardo
            if (firstLoaded) return;
            if (active == null) return;
            await Future.delayed(Duration(milliseconds: 200));
            _dispatchCustomEvent('insertSnippet', {
              "prefix": active.prefix,
              "description": active.description,
              "body": active.body.split('\n'),
              "scope": active.scope,
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
      ],
    );
  }
}
