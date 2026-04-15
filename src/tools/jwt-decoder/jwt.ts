export interface DecodedJwt {
  header: any
  headerRaw: string
  payload: any
  payloadRaw: string
  signature: string
  expiresAt: number | null
  issuedAt: number | null
  notBefore: number | null
  isExpired: boolean
}

export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) {
    base64 += '='.repeat(4 - pad)
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('无效的 JWT 格式，应包含三段（Header.Payload.Signature）')
  }

  const headerRaw = base64UrlDecode(parts[0])
  const header = JSON.parse(headerRaw)
  const payloadRaw = base64UrlDecode(parts[1])
  const payload = JSON.parse(payloadRaw)

  const expiresAt = payload.exp ?? null
  const issuedAt = payload.iat ?? null
  const notBefore = payload.nbf ?? null
  const isExpired = expiresAt !== null ? Date.now() / 1000 > expiresAt : false

  return {
    header,
    headerRaw: JSON.stringify(header),
    payload,
    payloadRaw: JSON.stringify(payload),
    signature: parts[2],
    expiresAt,
    issuedAt,
    notBefore,
    isExpired,
  }
}
