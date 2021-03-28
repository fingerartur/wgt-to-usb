import fs from 'fs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { getOutputDir } from './samsung'

function validateFilePaths(filePaths: string[]) {
  const file = filePaths[0]

  if (filePaths.length > 1) {
    throw new Error('Only 1 file may be passed.')
  } else if (filePaths.length === 0) {
    throw new Error('Please specify a .wgt file.')
  } else if (!/.wgt$/.test(file)) {
    throw new Error(`${file} is not a .wgt file.`)
  } else if (!fs.existsSync(file)) {
    throw new Error(`File does not exist ${file}`)
  } else {
    return true
  }
}

function validateOutputPath(path: string | null) {
  const outputDir = getOutputDir(path)

  if (fs.existsSync(outputDir)) {
    throw new Error(`${outputDir} already exists`)
  }

  return true
}

export function getArgs() {
  const { argv } = yargs(hideBin(process.argv))
    .usage('wgt-to-usb [file.wgt]')
    .option('output-dir', {
      alias: 'o',
      type: 'string',
      description: 'Output directory',
    })
    .check((argv: any) => {
      const { _: filePaths, o } = argv
      return validateFilePaths(filePaths) && validateOutputPath(o)
    })
    .help('help')

  return {
    outputPath: argv.o as string | null,
    wgtFile: argv._[0] as string,
  }
}
