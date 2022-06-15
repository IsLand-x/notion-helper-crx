import type { SendEventType } from "~type"

type PickSendEventType<T extends SendEventType["type"],U = SendEventType> = U extends { type: T } ? U : never;

type Handler<T extends SendEventType["type"]> = (payload: PickSendEventType<T>["payload"], sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void 

const getUrl = (path:string)=> 'https://notion-helper.island-x.tech'+path

const saveTokenHandler:Handler<"saveToken"> = async (payload,sender,sendResponse) => {
  const data = await fetch(getUrl('/checkIfExist'), {
    method: 'POST',
    headers: {
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      secret:payload.token
    })
  })
    .then(res => res.json())
    .then(res => {
      if (res.data.isExist) {
        chrome.storage.sync.set({ "token": payload.token })
      }
      return res
    })
    .catch(() => {
      return {
        errMsg:'网络错误'
      }
    })
  sendResponse(data)
}

const saveContentHandler: Handler<"saveContent"> = async (payload, sender, sendResponse) => {
  console.log(payload)
  const {token} = await chrome.storage.sync.get("token")
  const data = await fetch(getUrl('/saveContent'), {
    method: 'POST',
    headers: {
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      author: '',
      content:'',
      ...payload,
      secret: token
    })
  })
    .then(res => res.json())
    .catch(() => {
      return {
        errMsg:'网络错误'
      }
    })
  sendResponse(data)
}

const getTokenHandler: Handler<"getToken"> = async (payload, sender, sendResponse)=>{
  const token = await chrome.storage.sync.get("token")
  sendResponse(token)
}

const handlers = {
  saveToken: saveTokenHandler,
  getToken:getTokenHandler,
  saveContent: saveContentHandler
}

console.log('[Notion helper] Background script is running ')

chrome.runtime.onMessage.addListener((req: SendEventType, sender, sendResponse) => {
  // @ts-ignore
  handlers[req.type]?.(req.payload, sender, sendResponse)
  return true
})

let isNotifying = false
chrome.action.onClicked.addListener((tab) => {
  if ((tab.url?.startsWith("http"))) {
    chrome.tabs.query({
      active: true,
      currentWindow:true,
    }, (tabs) => {
      const message = {
        errMsg: 'ok',
        payload: {
          shouldShow:true
        }
      }
      chrome.tabs.sendMessage(tabs[0].id, message, () => {
        console.log('[Activate/Deactivated] Notion helper crx window visible status has changed!')
      })
    })
  } else if (!isNotifying) {
    isNotifying = true
    const id = '' + Math.random
    chrome.notifications.create(id, {
      title: 'Notion助手',
      type: 'basic',
      message: '仅支持https://或http://类型的网页剪藏。如果需要设置插件，请先进入任意可剪藏的网页。',
      iconUrl: 'data:image/png;base64,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',
      
    })
    setTimeout(() => {
      chrome.notifications.clear(id)
      isNotifying = false
    },10000)
  }
  return true
})