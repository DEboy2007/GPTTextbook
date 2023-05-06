import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  String _selectedBook = 'Select a textbook';
  String _userInput = '';
  String _displayText = '';

  void _onDropDownItemSelected(String newValue) {
    setState(() {
      _selectedBook = newValue;
    });
  }

  void _onSendButtonPressed() {
    setState(() {
      // Run main.py function gpt() here

      _displayText = _userInput;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GPT Textbook',
      theme: ThemeData.dark(),
      home: Scaffold(
        appBar: AppBar(
          title: Text('GPT Textbook'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              DropdownButton<String>(
                value: _selectedBook,
                icon: const Icon(Icons.arrow_downward),
                iconSize: 24,
                elevation: 16,
                style: const TextStyle(color: Colors.white),
                dropdownColor: Colors.grey[800],
                onChanged: (String? newValue) {
                  _onDropDownItemSelected(newValue!);
                },
                items: <String>[
                  'Select a textbook',
                  'AP Euro',
                ].map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
              ),
              SizedBox(height: 16),
              TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Ask your question',
                  fillColor: Colors.grey[800],
                  filled: true,
                ),
                onChanged: (value) {
                  _userInput = value;
                },
                style: TextStyle(color: Colors.white),
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _onSendButtonPressed,
                child: Text('Ask'),
              ),
              SizedBox(height: 16),
              Text(
                _displayText,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18.0,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
