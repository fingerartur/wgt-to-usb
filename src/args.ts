const fs = require('fs')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

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

export function getArgs() {
  const { argv } = yargs(hideBin(process.argv))
    .usage('wgt-to-usb [file.wgt]')
    .option('output-dir', {
      alias: 'o',
      type: 'string',
      description: 'Output directory',
    })
    .check((argv: any) => {
      const filePaths = argv._
      return validateFilePaths(filePaths)
    })
    .help('help')

  return {
    outputPath: argv.o,
    wgtFile: argv._[0],
  }
}
