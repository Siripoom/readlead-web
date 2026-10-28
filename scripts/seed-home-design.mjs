import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const index = args.findIndex((argument) => argument === '--backoffice' || argument.startsWith('--backoffice='))
let backofficePath = '../readlead-backoffice'
if (index >= 0) {
  const argument = args[index]
  backofficePath = argument.includes('=') ? args.splice(index, 1)[0].slice('--backoffice='.length) : args.splice(index, 2)[1]
  if (!backofficePath || backofficePath.startsWith('--')) throw new Error('Pass a path after --backoffice')
}
const backoffice = resolve(backofficePath)
const result = spawnSync(process.execPath, [resolve(backoffice, 'scripts/seed-home-design.mjs'), ...args], { stdio: 'inherit' })
if (result.error) throw result.error
process.exit(result.status ?? 1)
