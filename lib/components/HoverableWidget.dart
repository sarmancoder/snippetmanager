import 'package:flutter/material.dart';

class HoverableWidget extends StatefulWidget {
  final Widget Function(bool hovered) builder;

  const HoverableWidget({super.key, required this.builder});

  @override
  State<HoverableWidget> createState() => _HoverableWidgetState();
}

class _HoverableWidgetState extends State<HoverableWidget> {
  bool hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.copy,
      hitTestBehavior: HitTestBehavior.opaque,
      opaque: true,
      onEnter: (event) {
        setState(() {
          hovered = true;
        });
      },
      onExit: (event) {
        setState(() {
          hovered = false;
        });
      },
      child: widget.builder(hovered),
    );
  }
}
