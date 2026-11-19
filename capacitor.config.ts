import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.followdesk.app',
  appName: 'SOCIALKILLER',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
