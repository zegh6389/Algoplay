import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/monokai-sublime.dart';

import '../../../algorithms/code/code_implementations.dart';

/// Code viewer widget with syntax highlighting, language tabs, and line highlighting.
class CodeViewer extends StatefulWidget {
  const CodeViewer({
    super.key,
    required this.code,
    this.currentLine,
    this.onLanguageChanged,
  });

  final AlgorithmCode code;
  final int? currentLine;
  final ValueChanged<String>? onLanguageChanged;

  @override
  State<CodeViewer> createState() => _CodeViewerState();
}

class _CodeViewerState extends State<CodeViewer>
    with SingleTickerProviderStateMixin {
  String _language = 'python';
  bool _copied = false;

  static const _languages = [
    ('python', 'Python', 'py'),
    ('java', 'Java', 'java'),
    ('cpp', 'C++', 'cpp'),
  ];

  String get _code {
    switch (_language) {
      case 'python':
        return widget.code.python;
      case 'java':
        return widget.code.java;
      case 'cpp':
        return widget.code.cpp;
      default:
        return widget.code.python;
    }
  }

  String get _mode {
    switch (_language) {
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      default:
        return 'python';
    }
  }

  Future<void> _copyCode() async {
    await Clipboard.setData(ClipboardData(text: _code));
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final lines = _code.split('\n');

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF23241F),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Top bar: language tabs + copy + complexity
          _TopBar(
            languages: _languages,
            selectedLanguage: _language,
            onLanguageSelected: (lang) {
              setState(() => _language = lang);
              widget.onLanguageChanged?.call(lang);
            },
            onCopy: _copyCode,
            copied: _copied,
            timeComplexity: widget.code.timeComplexity,
            spaceComplexity: widget.code.spaceComplexity,
          ),
          // Code area
          Flexible(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.zero,
              child: ConstrainedBox(
                constraints: const BoxConstraints(minWidth: 400),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Line numbers
                    _LineNumbers(
                      count: lines.length,
                      highlightLine: widget.currentLine,
                    ),
                    // Code
                    _CodeBlock(
                      code: _code,
                      mode: _mode,
                      highlightLine: widget.currentLine,
                      totalLines: lines.length,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Top bar with tabs, copy, complexity badges
// ─────────────────────────────────────────────

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.languages,
    required this.selectedLanguage,
    required this.onLanguageSelected,
    required this.onCopy,
    required this.copied,
    required this.timeComplexity,
    required this.spaceComplexity,
  });

  final List<(String, String, String)> languages;
  final String selectedLanguage;
  final ValueChanged<String> onLanguageSelected;
  final VoidCallback onCopy;
  final bool copied;
  final String timeComplexity;
  final String spaceComplexity;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
      decoration: const BoxDecoration(
        color: Color(0xFF1E1E1E),
        border: Border(
          bottom: BorderSide(color: Color(0xFF333333), width: 1),
        ),
      ),
      child: Row(
        children: [
          // macOS dots
          Row(
            children: [
              _dot(Colors.redAccent),
              const SizedBox(width: 6),
              _dot(Colors.yellowAccent),
              const SizedBox(width: 6),
              _dot(Colors.greenAccent),
            ],
          ),
          const SizedBox(width: 16),
          // Language tabs
          ...languages.map((lang) {
            final (key, label, _) = lang;
            final isSelected = key == selectedLanguage;
            return Padding(
              padding: const EdgeInsets.only(right: 4),
              child: GestureDetector(
                onTap: () => onLanguageSelected(key),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF3B82F6)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white54,
                      fontSize: 12,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ),
            );
          }),
          const Spacer(),
          // Complexity badges
          _badge('Time: $timeComplexity'),
          const SizedBox(width: 6),
          _badge('Space: $spaceComplexity'),
          const SizedBox(width: 10),
          // Copy button
          GestureDetector(
            onTap: onCopy,
            child: Icon(
              copied ? Icons.check : Icons.copy,
              color: copied ? Colors.greenAccent : Colors.white54,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }

  Widget _dot(Color color) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _badge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF333333),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 10,
          fontFamily: 'monospace',
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Line numbers gutter
// ─────────────────────────────────────────────

class _LineNumbers extends StatelessWidget {
  const _LineNumbers({
    required this.count,
    required this.highlightLine,
  });

  final int count;
  final int? highlightLine;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF1A1A1A),
        border: Border(
          right: BorderSide(color: Color(0xFF333333), width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(count, (i) {
          final lineNum = i + 1;
          final isHighlighted = lineNum == highlightLine;
          return SizedBox(
            height: 18,
            child: Text(
              '$lineNum'.padLeft(3),
              style: TextStyle(
                color: isHighlighted
                    ? const Color(0xFFE5C07B)
                    : const Color(0xFF636363),
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight:
                    isHighlighted ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Syntax-highlighted code block
// ─────────────────────────────────────────────

class _CodeBlock extends StatelessWidget {
  const _CodeBlock({
    required this.code,
    required this.mode,
    required this.highlightLine,
    required this.totalLines,
  });

  final String code;
  final String mode;
  final int? highlightLine;
  final int totalLines;

  @override
  Widget build(BuildContext context) {
    final lines = code.split('\n');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(lines.length, (i) {
          final lineNum = i + 1;
          final isHighlighted = lineNum == highlightLine;

          return Container(
            width: double.maxFinite,
            padding: EdgeInsets.only(
              left: isHighlighted ? 4 : 0,
              right: 4,
            ),
            decoration: isHighlighted
                ? BoxDecoration(
                    color: const Color(0xFFE5C07B).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(3),
                    border: Border.all(
                      color: const Color(0xFFE5C07B).withValues(alpha: 0.3),
                      width: 1,
                    ),
                  )
                : null,
            child: HighlightView(
              lines[i],
              language: mode,
              theme: monokaiSublimeTheme,
              textStyle: const TextStyle(
                fontSize: 12,
                fontFamily: 'monospace',
                height: 18 / 12,
              ),
              padding: EdgeInsets.zero,
            ),
          );
        }),
      ),
    );
  }
}
