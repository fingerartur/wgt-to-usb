#!/usr/bin/env node

import { downloadUsbFiles, getSamsungUsbToolCookies, uploadWgtFile } from './samsung'
import { getArgs } from './args'

async function main() {
  const { wgtFile, outputPath } = getArgs()
  const { cookies, sessionId } = await getSamsungUsbToolCookies()
  await uploadWgtFile(wgtFile, sessionId, cookies)
  await downloadUsbFiles(outputPath, cookies)
}

main()
