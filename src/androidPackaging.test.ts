// @vitest-environment node
import { describe, expect, it } from 'vitest';
import config from '../capacitor.config';
import packageJson from '../package.json';

describe('Android packaging contract', () => {
  it('embeds the root-mode web build in the Jansang Star Android app', () => {
    expect(config).toMatchObject({
      appId: 'com.jansang.star',
      appName: '잔상 별자리',
      webDir: 'dist',
      server: { androidScheme: 'https' },
    });
    expect(packageJson.scripts).toMatchObject({
      'build:android:web': 'npm run build',
      'cap:sync:android': 'npm run build:android:web && cap sync android',
      'apk:debug': 'npm run cap:sync:android && cd android && gradlew.bat assembleDebug',
    });
    expect(packageJson.dependencies).toMatchObject({
      '@capacitor/core': '8.5.0',
      '@capacitor/android': '8.5.0',
    });
    expect(packageJson.devDependencies).toMatchObject({ '@capacitor/cli': '8.5.0' });
  });
});
