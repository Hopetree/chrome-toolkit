import { describe, it, expect } from 'vitest'
import { base64UrlDecode, decodeJwt, formatTime } from '../jwt'

// 测试用的标准 JWT（HS256, payload 含 exp/iat/nbf）
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5iZWpzb24uY29tIiwic3ViIjoiZGVtbyIsImlhdCI6MTc3NjIyMDc0MywibmJmIjoxNzc2MjIwNzQzLCJleHAiOjE3NzYzMDcxNDN9.KmMBAou56-ipc3LcO2WVgrWGXrM2MdQOdwwdmIWVs8c'

// 手动构造一个已过期的 JWT（exp 设为过去的时间）
function makeExpiredJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const body = btoa(
    JSON.stringify({ ...payload, exp: 1000000000 })
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const sig = 'fake-signature'
  return `${header}.${body}.${sig}`
}

// 手动构造一个不过期的 JWT（exp 设为未来很远的时间）
function makeNonExpiredJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const body = btoa(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 999999999 })
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const sig = 'fake-signature'
  return `${header}.${body}.${sig}`
}

describe('base64UrlDecode', () => {
  it('正确解码标准 base64url 字符串', () => {
    // "Hello" 的 base64url 编码（无填充）
    expect(base64UrlDecode('SGVsbG8')).toBe('Hello')
  })

  it('正确处理含 - 和 _ 的 base64url 字符串', () => {
    // 包含 + 和 / 的情况会映射为 - 和 _
    const encoded = btoa('{"key":"value+with/special"}')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    expect(base64UrlDecode(encoded)).toBe('{"key":"value+with/special"}')
  })

  it('正确处理需要补齐填充的字符串', () => {
    // "Hi" 的 base64url 编码
    const encoded = btoa('Hi').replace(/=/g, '')
    expect(base64UrlDecode(encoded)).toBe('Hi')
  })
})

describe('formatTime', () => {
  it('正确格式化时间戳', () => {
    // 2025-04-13 12:05:43 UTC
    expect(formatTime(1776220743)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})

describe('decodeJwt', () => {
  it('正确解析有效 JWT 的 header', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.header.alg).toBe('HS256')
    expect(result.header.typ).toBe('JWT')
  })

  it('正确解析有效 JWT 的 payload', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.payload.username).toBe('www.bejson.com')
    expect(result.payload.sub).toBe('demo')
    expect(result.payload.iat).toBe(1776220743)
    expect(result.payload.nbf).toBe(1776220743)
    expect(result.payload.exp).toBe(1776307143)
  })

  it('正确提取 signature', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.signature).toBe('KmMBAou56-ipc3LcO2WVgrWGXrM2MdQOdwwdmIWVs8c')
  })

  it('正确判断过期状态', () => {
    const result = decodeJwt(VALID_JWT)
    // exp=1776307143 (2026-04-14)，根据运行时间可能过期或未过期
    expect(typeof result.isExpired).toBe('boolean')
  })

  it('已过期的 JWT isExpired 为 true', () => {
    const token = makeExpiredJwt({ sub: 'test' })
    const result = decodeJwt(token)
    expect(result.isExpired).toBe(true)
  })

  it('未过期的 JWT isExpired 为 false', () => {
    const token = makeNonExpiredJwt({ sub: 'test' })
    const result = decodeJwt(token)
    expect(result.isExpired).toBe(false)
  })

  it('无 exp 字段时 expiresAt 为 null 且 isExpired 为 false', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    const body = btoa(JSON.stringify({ sub: 'test', iat: 1234567890 }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    const token = `${header}.${body}.fake-sig`

    const result = decodeJwt(token)
    expect(result.expiresAt).toBeNull()
    expect(result.isExpired).toBe(false)
  })

  it('缺少 exp 时 issuedAt 正常提取', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.issuedAt).toBe(1776220743)
  })

  it('headerRaw 和 payloadRaw 为 JSON 字符串', () => {
    const result = decodeJwt(VALID_JWT)
    expect(() => JSON.parse(result.headerRaw)).not.toThrow()
    expect(() => JSON.parse(result.payloadRaw)).not.toThrow()
  })

  it('非三段格式抛出错误', () => {
    expect(() => decodeJwt('invalid')).toThrow('无效的 JWT 格式')
    expect(() => decodeJwt('a.b')).toThrow('无效的 JWT 格式')
    expect(() => decodeJwt('a.b.c.d')).toThrow('无效的 JWT 格式')
  })

  it('无效的 base64url 抛出错误', () => {
    expect(() => decodeJwt('!!!.!!!.!!!')).toThrow()
  })

  it('非 JSON payload 抛出错误', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    const token = `${header}.not-json.fakesig`
    expect(() => decodeJwt(token)).toThrow()
  })
})
