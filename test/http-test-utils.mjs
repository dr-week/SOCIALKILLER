import http from 'node:http'

export function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(data) })
        } catch {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data })
        }
      })
    })
    req.on('error', reject)
    if (postData) req.write(typeof postData === 'string' ? postData : JSON.stringify(postData))
    req.end()
  })
}
