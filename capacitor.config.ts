import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.followdesk.app',
  appName: 'The Social Base',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
