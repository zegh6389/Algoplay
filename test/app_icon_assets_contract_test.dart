import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';

class PngInfo {
  const PngInfo({
    required this.width,
    required this.height,
    required this.colorType,
  });

  final int width;
  final int height;
  final int colorType;

  bool get hasAlpha => colorType == 4 || colorType == 6;
}

PngInfo readPngInfo(String path) {
  final bytes = File(path).readAsBytesSync();
  expect(bytes.length, greaterThan(26), reason: '$path is too small for PNG');
  expect(bytes.sublist(12, 16), equals('IHDR'.codeUnits));
  final data = ByteData.sublistView(bytes);
  return PngInfo(
    width: data.getUint32(16),
    height: data.getUint32(20),
    colorType: data.getUint8(25),
  );
}

void main() {
  test('app icons use the supplied artwork on the cropped opaque background', () {
    final icon = readPngInfo('assets/images/icon.png');
    final adaptive = readPngInfo('assets/images/adaptive-icon.png');
    final colors = File(
      'android/app/src/main/res/values/colors.xml',
    ).readAsStringSync();
    final adaptiveXml = File(
      'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    ).readAsStringSync();

    expect(icon.width, 1024);
    expect(icon.height, 1024);
    expect(icon.hasAlpha, isFalse, reason: 'app icon must be background-baked');

    expect(adaptive.width, 1024);
    expect(adaptive.height, 1024);
    expect(
      adaptive.hasAlpha,
      isFalse,
      reason:
          'adaptive source is also background-baked for launcher and Play surfaces',
    );

    expect(colors, contains('<color name="iconBackground">#e8e8e8</color>'));
    expect(
      adaptiveXml,
      contains('<background android:drawable="@color/iconBackground"/>'),
    );
    expect(
      adaptiveXml,
      contains(
        '<foreground android:drawable="@mipmap/ic_launcher_foreground"/>',
      ),
    );
  });
}
