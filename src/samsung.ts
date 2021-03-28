import fetch, { Response } from 'node-fetch'
import fs from 'fs'
import FormData from 'form-data'
import {
  getSessionId, parseNodeFetchCookies, downloadFile, Cookie, cookiesToString,
} from './utils'

export async function getSamsungUsbToolCookies() {
  const uri = 'https://appsign.samsungqbe.com:8080/'
  console.log(`Collecting cookies from USB Demo packaging tool ${uri}...`)

  let response: Response

  try {
    response = await fetch(uri)
  } catch (error) {
    throw new Error('Failed to fetch cookies (request failed)')
  }

  const cookies = parseNodeFetchCookies(response.headers.raw()['set-cookie'])
  const sessionId = getSessionId(cookies)

  if (!sessionId) {
    throw new Error('Session ID cookie not found')
  }

  const result = {
    cookies,
    sessionId,
  }

  console.log('Cookies collected successfully.')

  return result
}

function parseWgtFileUploadResponse(response: string) {
  // see https://appsign.samsungqbe.com:8080/js/main.js
  let error: string|null = null

  switch (response) {
    case 'ok': break
    case 'noWgt':
      error = "Error response: Please upload wgt file only. An error occurred while trying to decompress the file. this issue occurs if there is a blank space or there are incorrect symbols in the file name. Also you can't decompress files that affects DRM. After reconfirm the File name, please upload again."
      break
    case 'failUpload':
      error = 'Error response: File upload failed. Please upload again.'
      break
    case 'noFile':
      error = 'Error response: File upload failed. Please upload again. There are no author-signature.xml, config.xml, signature1.xml in wgt file. check this.'
      break
    default:
      error = 'Error response: Unspecified server error.'
  }

  return { error }
}

export async function uploadWgtFile(wgtFile: string, sessionId: string, cookies: Cookie[]) {
  const uri = 'https://appsign.samsungqbe.com:8080/uploadAjax.php'
  console.log(`Uploading ${wgtFile} to ${uri}...`)

  const form = new FormData()
  form.append('sId', sessionId)
  form.append(
    'userfile',
    fs.createReadStream(wgtFile),
  )

  let response: Response

  try {
    // This request does not correspond to original browser request one-to-one,
    // some headers are left out because for some reason they cause a `failUpload` response
    response = await fetch(uri, {
      method: 'post',
      body: form,
      headers: {
        origin: 'https://appsign.samsungqbe.com:8080',
        referer: 'https://appsign.samsungqbe.com:8080/',
        cookie: cookiesToString(cookies),
      },
    })
  } catch (error) {
    throw new Error('Failed to upload .wgt file (request failed)')
  }

  const responseText = await response.text()
  const { error } = parseWgtFileUploadResponse(responseText)

  if (error) {
    throw new Error(error)
  }

  console.log('Upload successful.')
}

export function getOutputDir(path: string | null) {
  return `${path ?? '.'}/userwidget`
}

export async function downloadUsbFiles(dir: string | null, cookies: Cookie[]) {
  const outputDir = getOutputDir(dir)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const headers = {
    cookie: cookiesToString(cookies),
    authority: 'appsign.samsungqbe.com:8080',
    'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    referer: 'https://appsign.samsungqbe.com:8080/',
    'accept-language': 'en-US,en;q=0.9',
  }

  await downloadFile(
    'https://appsign.samsungqbe.com:8080/download.php?type=license',
    `${outputDir}/widget.license`,
    headers,
  )

  await downloadFile(
    'https://appsign.samsungqbe.com:8080/download.php?type=tmg',
    `${outputDir}/app.tmg`,
    headers,
  )

  console.info(`USB files successfully downloaded to ${outputDir}.`)
}
