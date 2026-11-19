import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

class FakeElement {
  constructor(tagName, attrs = {}, text = '') {
    this.tagName = tagName.toUpperCase()
    this.attrs = attrs
    this.innerText = text
    this.value = ''
    this.isContentEditable = false
    this.clicked = false
    this.events = []
  }
  getAttribute(name) { return this.attrs[name] ?? null }
  closest(selector) {
    if (selector === 'button,[role="button"]' && (this.tagName === 'BUTTON' || this.attrs.role === 'button')) return this
    if (selector === 'form' && this.attrs.inForm) return this
    if (selector === 'a' && this.tagName === 'A') return this
    return null
  }
  focus() { this.focused = true }
  click() { this.clicked = true }
  dispatchEvent(event) { this.events.push(event.type); return true }
}

class FakeInput extends FakeElement {
  constructor(attrs = {}) { super('input', attrs) }
  get value() { return this._value || '' }
  set value(value) { this._value = value }
}

function loadRecorder(elements = []) {
  const docListeners = new Map()
  const winListeners = new Map()
  const bySelector = new Map()
  for (const element of elements) {
    for (const [key, value] of Object.entries(element.attrs)) {
      bySelector.set(`${element.tagName.toLowerCase()}[${key}="${value}"]`, element)
    }
  }
  let messageListener
  const context = {
    window: {
      scrollY: 0,
      scrollBy() {},
      addEventListener: (type, callback) => winListeners.set(type, callback),
      removeEventListener: type => winListeners.delete(type)
    },
    document: {
      addEventListener: (type, callback) => docListeners.set(type, callback),
      removeEventListener: type => docListeners.delete(type),
      querySelector: selector => bySelector.get(selector) || null
    },
    location: { origin: 'https://example.test' },
    Element: FakeElement,
    HTMLElement: FakeElement,
    HTMLInputElement: FakeInput,
    HTMLTextAreaElement: class FakeTextarea extends FakeElement {},
    InputEvent: class { constructor(type) { this.type = type } },
    Event: class { constructor(type) { this.type = type } },
    chrome: { runtime: { onMessage: { addListener: listener => { messageListener = listener } } } },
    setTimeout,
    clearTimeout,
    Math
  }
  const source = readFileSync(new URL('../extension/modules/interaction-recorder.js', import.meta.url), 'utf8')
  runInNewContext(source, context)
  return {
    docListeners,
    send(message) {
      return new Promise(resolve => {
        const async = messageListener(message, {}, resolve)
        if (!async) return
      })
    }
  }
}

test('recorder stores stable action targets but never captures typed text or submit actions', async () => {
  const menu = new FakeElement('button', { 'aria-label': 'Open menu' }, 'Open')
  const submit = new FakeElement('button', { 'aria-label': 'Send', type: 'submit' }, 'Send')
  const search = new FakeInput({ placeholder: 'Search' })
  const recorder = loadRecorder([menu, submit, search])

  assert.equal((await recorder.send({ type: 'FOUNDRYDESK_WORKFLOW_START_RECORDING' })).success, true)
  recorder.docListeners.get('click')({ target: menu })
  recorder.docListeners.get('click')({ target: submit })
  search.value = 'private typed query'
  recorder.docListeners.get('input')({ target: search })
  const saved = await recorder.send({ type: 'FOUNDRYDESK_WORKFLOW_STOP_RECORDING' })

  assert.equal(saved.steps.length, 2)
  assert.equal(saved.steps.map(step => step.action).join(','), 'click,fill')
  assert.equal(saved.steps[0].selector, 'button[aria-label="Open menu"]')
  assert.equal(saved.steps[1].value, '')
  assert.equal(JSON.stringify(saved.steps).includes('private typed query'), false)
})

test('replay fills a reviewed field but refuses submit-style controls', async () => {
  const search = new FakeInput({ placeholder: 'Search' })
  const sendButton = new FakeElement('button', { 'aria-label': 'Send' }, 'Send')
  const recorder = loadRecorder([search, sendButton])
  const result = await recorder.send({
    type: 'FOUNDRYDESK_WORKFLOW_REPLAY',
    workflow: { origin: 'https://example.test', steps: [
      { action: 'fill', selector: 'input[placeholder="Search"]', value: 'approved text' },
      { action: 'click', selector: 'button[aria-label="Send"]' }
    ] }
  })

  assert.equal(search.value, 'approved text')
  assert.equal(sendButton.clicked, false)
  assert.equal(result.success, false)
  assert.match(result.results[1].error, /not replayable/)
})
