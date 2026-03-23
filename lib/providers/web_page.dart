import 'dart:convert';

import 'package:aisnippets/business/models/Snippet.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'web_page.g.dart';

class WebPageState {
  final bool active;
  final InAppWebViewController? controller;

  WebPageState({this.active = false, this.controller});
}

@riverpod
class WebPage extends _$WebPage {
  @override
  WebPageState build() {
    return WebPageState();
  }

  setController(InAppWebViewController controller) {
    state = WebPageState(active: true, controller: controller);
  }

  close() {
    state = WebPageState(active: false, controller: null);
  }

  sendSnippet(Snippet c) {
    if (!state.active) return false;
    _dispatchCustomEvent('insertSnippet', {
      "prefix": c.prefix,
      "description": c.description,
      "body": c.body.split('\n'),
      "scope": c.scope,
    });
    return true;
  }

  Future<void> _dispatchCustomEvent(
    String eventName,
    Map<String, dynamic> detail,
  ) async {
    var webViewController = state.controller;
    if (webViewController == null) return;
    final jsonDetail = jsonEncode(detail);
    await webViewController.evaluateJavascript(
      source:
          """
    window.dispatchEvent(new CustomEvent("$eventName", {
      detail: $jsonDetail,
      bubbles: true,
      cancelable: true
    }));
  """,
    );
  }
}
