export function simulateRequest(handler, method, path, payload = null, headers = {}) {
  return new Promise(resolve => {
    const body = payload === null ? null : Buffer.from(JSON.stringify(payload))
    const req = {
      method, url: path,
      headers: { host: '127.0.0.1:4174', ...headers },
      on(event, callback) {
        if (event === 'data' && body) callback(body)
        if (event === 'end') callback()
      },
      async *[Symbol.asyncIterator]() {
        if (body) yield body
      }
    }
    let statusCode = 200
    let responseHeaders = {}
    let responseBody = ''
    const res = {
      writeHead(code, response) { statusCode = code; responseHeaders = response || {} },
      end(data) {
        if (data) responseBody += data.toString()
        try {
          resolve({ status: statusCode, headers: responseHeaders, body: JSON.parse(responseBody) })
        } catch {
          resolve({ status: statusCode, headers: responseHeaders, body: responseBody })
        }
      }
    }
    Promise.resolve(handler(req, res)).catch(error => resolve({ status: 500, body: { error: error.message } }))
  })
}
