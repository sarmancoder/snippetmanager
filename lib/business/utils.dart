import 'package:intl/intl.dart';

String getUid() {
  DateTime now = DateTime.now();
  String formattedDate = DateFormat('yyyyMMddHHmmss').format(now);
  return formattedDate;
}
