import type { ZhiziCloudLoginRequest } from '@main/lib/types'

const ZHIZI_LOGIN_URL = 'https://www.zhizigo.com/api/cluster/account/login'

function findToken(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const object = value as Record<string, unknown>
  for (const key of ['token', 'accessToken', 'access_token']) {
    const candidate = object[key]
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }
  for (const nested of ['data', 'result', 'account', 'user']) {
    const token = findToken(object[nested])
    if (token) return token
  }
  return ''
}

function humanizeZhiziLoginError(status: number, body: unknown, rawText: string): string {
  const object = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const key = String(object.key ?? object.error ?? object.message ?? '').trim()
  if (/invalid_password|password/i.test(key)) {
    return '智子云登录失败：账号或密码不正确。'
  }
  if (/invalid|credential/i.test(key)) {
    return '智子云登录失败：账号凭据无效。'
  }
  if (status === 429) {
    return '智子云登录请求过于频繁，请稍后再试。'
  }
  if (status >= 500) {
    return '智子云登录服务暂时不可用，请稍后再试。'
  }
  return `智子云登录失败：HTTP ${status}${key ? ` · ${key}` : rawText ? ` · ${rawText.slice(0, 120)}` : ''}`
}

export async function loginZhiziCloudByPassword(request: ZhiziCloudLoginRequest): Promise<{ token: string; message: string }> {
  const phone = request.phone.trim()
  const password = request.password.trim()
  if (!phone || !password) {
    throw new Error('请输入智子云账号和密码。')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20_000)
  try {
    const response = await fetch(ZHIZI_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, password }),
      signal: controller.signal
    })
    const rawText = await response.text()
    let json: unknown = undefined
    try {
      json = rawText ? JSON.parse(rawText) : undefined
    } catch {
      json = undefined
    }
    if (!response.ok) {
      throw new Error(humanizeZhiziLoginError(response.status, json, rawText))
    }
    const token = findToken(json)
    if (!token) {
      throw new Error('智子云登录成功但没有返回 token，请更新智子客户端或稍后重试。')
    }
    return { token, message: '智子云登录成功，已保存 token。' }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('智子云登录超时，请检查网络后重试。')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
