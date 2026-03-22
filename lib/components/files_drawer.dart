import 'package:flutter/material.dart';

class FilesDrawer extends StatelessWidget {
  const FilesDrawer({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          // height: 150,
          width: double.infinity,
          color: Theme.of(context).colorScheme.primary,
          padding: const EdgeInsets.all(16),
          child: const Align(
            alignment: Alignment.bottomLeft,
            child: Text(
              'Menú Lateral\nIzquierdo',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              children: [
                for (var var_name = 0; var_name < 20; var_name++)
                  ListTile(
                    dense: true,
                    title: Text('Inici sddddgho $var_name'),
                    onTap: () {},
                  ),
              ],
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(vertical: 8.0),
          child: ElevatedButton(
            child: const Text('Añadir archivo'),
            onPressed: () {},
          ),
        )
      ],
    );
  }
}
