import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

var testsnippet = """
{
  "prefix": "react-ts-component",
  "description": "React component with default export and typed props",
  "scope": "javascript,typescript",
  "body": [
    "import React from 'react';",
    "",
    "type \${TM_FILENAME_BASE}Props = {",
    "  // TODO: add props",
    "};",
    "",
    "const \${TM_FILENAME_BASE}: React.FC<\${TM_FILENAME_BASE}Props> = (props) => {",
    "  return (",
    "    <div>",
    "      {/* TODO: implement */}",
    "    </div>",
    "  );",
    "};",
    "",
    "export default \${TM_FILENAME_BASE};"
  ]
}
""";

var initScript = (String themeStr) =>
    """
    (function() {
      // 1. Definimos la variable theme dentro de JS usando el valor de Flutter
      const theme = '$themeStr'; 
      const root = document.documentElement;

      // 2. Inyectamos los estilos de transparencia
      const style = document.createElement('style');
      style.innerHTML = `
        :root { --background: transparent !important; }
        html, body { background-color: transparent !important; background: transparent !important; }
      `;
      document.head.appendChild(style);

      // 3. Ahora sí, el alert funcionará porque 'theme' existe
      console.log("Cambiando tema a: " + theme); 
      // alert(theme); // Descomenta si quieres ver el popup
      
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    })();
""";

class SnippetsWebPage extends StatefulWidget {
  const SnippetsWebPage({super.key});

  @override
  State<SnippetsWebPage> createState() => _SnippetsWebPageState();
}

class _SnippetsWebPageState extends State<SnippetsWebPage> {
  InAppWebViewController? _webViewController; // ← Aquí guardamos el controller

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

  // Ejemplo alternativo: usando postMessage (más estándar y seguro)
  Future<void> _sendPostMessage(Map<String, dynamic> message) async {
    if (_webViewController == null) return;

    final jsonMessage = Uri.encodeComponent(message.toString()); // o jsonEncode

    await _webViewController!.evaluateJavascript(
      source:
          """
      window.postMessage($message, "*");  // "*" para permitir cualquier origen (cuidado en prod)
    """,
    );
  }

  bool unable = false;
  TextEditingController controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
        children: [
          Expanded(
            child: InAppWebView(
              initialUrlRequest: URLRequest(
                url: WebUri('http://localhost:3000'),
              ),

              onWebViewCreated: (controller) {
                _webViewController = controller;
                debugPrint('WebView creado');

                controller.addJavaScriptHandler(
                  handlerName: 'updateSnippet',
                  callback: (args) {
                    /*BlocProvider.of<SnippetCubit>(context).updateSnippet(
                      jsonDecode(args[0])
                    );*/
                  },
                );
              },

              onConsoleMessage: (controller, consoleMessage) {
                print("JS Console: ${consoleMessage.message}");
              },

              onLoadStop: (controller, url) async {
                // Obtenemos el tema actual de Flutter
                /*String themeStr = themeNotifier.value == Brightness.dark
                    ? 'dark'
                    : 'light';

                await controller.evaluateJavascript(
                  source: initScript(themeStr),
                );*/
              },

              initialSettings: InAppWebViewSettings(
                // EN LA V6, AMBOS VAN AQUÍ:
                // backgroundColor: const Color(0x00000000),
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

  requestAi() async {
    setState(() {
      unable = true;
    });
    if (controller.text.isEmpty) return;
    print("preguntando a ollama");
    //var response = await preguntarOllama(controller.text);
    var response = jsonDecode(testsnippet);
    /*print(response);
    if (response != "0")
      print(jsonDecode(response)['prefix']);*/

    await _dispatchCustomEvent("insertSnippet", response);
    setState(() {
      unable = false;
    });
    /*await _dispatchCustomEvent('snippetUpdated', {
          'action': 'save',
          'data': {'title': 'Mi snippet', 'code': 'print("hola")'},
        });*/
    // O con postMessage:
    // await _sendPostMessage({'type': 'snippetUpdated', 'payload': {...}});
  }

  // Ejemplo de uso: botón que dispara un evento
  // (puedes poner esto en otro lugar de tu UI)
  Widget _buildTestButton() {
    return ElevatedButton(
      onPressed: unable
          ? null
          : () async {
              requestAi();
            },
      child: const Text('Disparar evento a la web'),
    );
  }
}
