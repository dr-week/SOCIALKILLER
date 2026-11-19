import { runCli } from './index.ts'

runCli().then(code => {
  process.exitCode = code
})
