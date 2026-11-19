/** Manifest V3 service-worker composition root for the extension. */
import { ensureAppRunning, registerAppLifecycle } from './modules/background/app-lifecycle.js'
import { logExtensionError, reportExtensionLog } from './modules/background/extension-logger.js'
import { createPlatformDispatcher } from './modules/background/platform-dispatch.js'
import { createPendingDispatchPoller } from './modules/background/pending-dispatch-poller.js'
import { registerContextMenuHandler } from './modules/background/context-menu.js'
import { registerKeepAliveAlarm } from './modules/background/keep-alive-alarm.js'
import { registerMessageRouter } from './modules/background/messages/register-message-router.js'

const openAndAutoFillPlatform = createPlatformDispatcher(reportExtensionLog)
export const pollPendingDispatchesNow = createPendingDispatchPoller(openAndAutoFillPlatform, reportExtensionLog)

registerAppLifecycle()
registerContextMenuHandler()
registerKeepAliveAlarm()
registerMessageRouter({ logError: logExtensionError, openAndAutoFillPlatform })

export { ensureAppRunning }
