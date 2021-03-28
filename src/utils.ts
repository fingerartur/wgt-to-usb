import fs from 'fs'
import fetch, { Response, HeadersInit } from 'node-fetch'
import streamToPromise from 'stream-to-promise'

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

export async function downloadFile(uri: string, name: string, headers: HeadersInit) {
  console.log(`Downloading ${uri} as ${name}...`)

  const outputFile = fs.createWriteStream(name)

  outputFile.on('error', (error) => {
    outputFile.end()
    throw error
  })

  let response: Response

  try {
    response = await fetch(uri, { headers })
  } catch (error) {
    throw new Error('Failed to download file (request failed)')
  }

  response.body.pipe(outputFile)

  await streamToPromise(outputFile)

  console.log('Download successful.')
}
