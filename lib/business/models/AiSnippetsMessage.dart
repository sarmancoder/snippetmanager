enum MessageType {System, User}

class AiSnippetsMessage {
  final String text;
  final MessageType type;

  AiSnippetsMessage({required this.text, required this.type});

  @override
  String toString() {
    // TODO: implement toString
    return text;
  }
}