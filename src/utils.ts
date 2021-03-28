const fs = require('fs')
const fetch = require('node-fetch')
const streamToPromise = require('stream-to-promise')

export interface Cookie {
    name: string
    value: string
}

/**
 * @param cookies node-fetch cookies (e.g. ['cookie1=val; path=/', 'cookie1=val; path=/'])
 */
export function parseNodeFetchCookies(cookies: string[]): Cookie[] {
  return cookies.map((cookie) => {
    const parts = cookie.split(';')
    const cookiePart = parts[0]
    const [name, value] = cookiePart.split('=')
    return { name, value }
  })
}

export function getSessionId(cookies: Cookie[]) {
  const cookie = cookies.find((cookie) => cookie.name === 'PHPSESSID')
  return cookie?.value ?? null
}

export function cookiesToString(cookies: Cookie[]) {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
}

export async function downloadFile(uri: string, name: string, headers: Object) {
  console.log(`Downloading ${uri} as ${name}`)

  const outputFile = fs.createWriteStream(name)
  const response = await fetch(uri, { headers })
  response.body.pipe(outputFile)

  return streamToPromise(outputFile) as Promise<void>
}
