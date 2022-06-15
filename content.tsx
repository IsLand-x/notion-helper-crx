// @ts-ignore A special syntax in parcel for importing module as text
import semiStyleText from 'bundle-text:@douyinfe/semi-ui/dist/css/semi.min.css';
// @ts-ignore
import contentStyleText from 'bundle-text:./contentStyle.css'

import { Card, Notification, Button, Tabs, TabPane } from '@douyinfe/semi-ui'
import { IconClose } from '@douyinfe/semi-icons';
import WebClip from '~contentPages/WebClip';
import Settings from '~contentPages/Settings';
import About from '~contentPages/About';

import { createContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { makeAutoObservable, reaction } from 'mobx'
import CollectingPage from '~contentPages/CollectingPage';
import type { SendEventType } from '~type';
let shadowRoot: ShadowRoot;

console.log("[Notion Helper] Content script has been injected")

export function getRootContainer() {
  const div = document.createElement("div")
  div.id = "__notion__helper__crx__"
  document.body.appendChild(div)

  const semiStyleEl = document.createElement("style")
  semiStyleEl.textContent = semiStyleText

  const contentStyleEl = document.createElement("style")
  contentStyleEl.textContent = contentStyleText
  document.body.appendChild(contentStyleEl)

  const shadow = div.attachShadow({ mode: 'open' })
  shadow.appendChild(semiStyleEl)

  shadowRoot = shadow

  return shadow
}

export const getMountPoint = undefined
export const getStyle = undefined


export const ShadowRootCtx = createContext(shadowRoot)

type CollectingType = "single" | "multiple"

type FormValueType = {
  articleName: string
  href: string
  date: string
  author: string
  content: string
}

class GlobalStore {
  constructor() {
    makeAutoObservable(this)
  }

  token: string = ''
  setToken(token: string) {
    this.isSettingToken = true
    this.sendEvent({
      type: "saveToken",
      payload: {
        token
      }
    }, (res: {
      errMsg: string;
      data: {
        isExist: boolean
      }
    }) => {
      res.errMsg !== 'ok'
        ? Notification.error({ title: res.errMsg })
        : res.data.isExist
          ? Notification.success({ title: "保存成功" })
          : Notification.warning({ title: '该用户不存在，请到微信小程序《Notion助手》中绑定' })
      res.data.isExist && (this.token = token)
      this.isSettingToken = false
    })
  }
  getToken() {
    this.sendEvent({
      type: "getToken",
      payload: {}
    }, (res) => {
      this.token = res.token
    })
  }
  isSettingToken: boolean = false

  isCollecting: boolean = false

  setCollecting(status: boolean) {
    this.isCollecting = status
  }

  collectingType: CollectingType = "single"

  setCollectingType(type: CollectingType) {
    this.collectingType = type
  }

  selectedDOMArr: Element[] = []
  handleSelectedDOM(d: Element) {
    if (this.selectedDOMArr.includes(d)) {
      d.classList.remove("__notion__helper__selected__")
      this.selectedDOMArr = this.selectedDOMArr.filter(r => r !== d)
    } else {
      // 如果是其中任意元素的子元素或父元素
      this.selectedDOMArr = this.selectedDOMArr.filter(el => {
        if (!(d.contains(el) || el.contains(d))) {
          return true
        }
        el.classList.remove("__notion__helper__selected__")
        return false
      })
      d.classList.add("__notion__helper__selected__")
      this.selectedDOMArr.push(d)
    }
  }
  removeAllSelectedDOM() {
    this.selectedDOMArr.forEach(d => {
      d.classList.remove("__notion__helper__selected__")
    })
    this.selectedDOMArr = []
  }

  isContentSaving: boolean = false
  contentSaveErrMsg: string = null
  saveContent() {
    this.isContentSaving = true
    this.sendEvent({
      type: "saveContent",
      payload: this.formValue
    }, (res) => {
      this.isContentSaving = false;
      this.contentSaveErrMsg = res.errMsg || JSON.stringify(res);
    })
  }

  formValue: FormValueType = {
    articleName: document.title,
    href: document.location.href,
    date: new Date().toString(),
    author: '',
    content: ''
  }

  setFormValue(partialState: Partial<FormValueType>) {
    this.formValue = { ...this.formValue, ...partialState }
  }
  resetFormValue() {
    this.formValue = {
      articleName: document.title,
      href: document.location.href,
      date: new Date().toString(),
      author: '',
      content: ''
    }
    this.isContentSaving = false;
    this.contentSaveErrMsg = null;
    this.removeAllSelectedDOM()
  }

  sendEvent(type: SendEventType, callback: Function) {
    chrome.runtime.sendMessage(type, res => {
      console.log("[Send Event Callback]", res)
      callback(res)
    })
  }

  shouldShow: boolean = false;
}

export const GlobalStoreCtx = createContext<GlobalStore>(null as any)

export default observer(() => {
  const globalStore = useRef(new GlobalStore()).current
  const [isDarkMode, setIsDarkMode] = useState(false)
  useEffect(() => {
    Notification.config({ zIndex: 10000000 })
    globalStore.getToken()
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      globalStore.shouldShow = request.payload.shouldShow
      sendResponse({ errMsg: 'ok' })
    })
    reaction(() => globalStore.shouldShow,
      () => {
        globalStore.resetFormValue()
        globalStore.removeAllSelectedDOM()
      })
    console.log("[Notion Helper] Global state has been initialized.")
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    console.log('[Notion Helper] System dark mode status: ', mql.matches || false)
    if (mql?.matches) {
      document.body.setAttribute("theme-mode", "dark")
    }
  }, [])

  return (
    <GlobalStoreCtx.Provider value={globalStore}>
      <ShadowRootCtx.Provider value={shadowRoot}>
        {
          globalStore.shouldShow
            ? (
              <div id='__notion__helper__root__' className={isDarkMode ? 'semi-always-dark' : 'semi-always-light'}>
                <Card shadows="always">
                  {
                    globalStore.isCollecting ? <CollectingPage /> : <Tabs type='button' tabBarExtraContent={
                      <Button
                        type='danger'
                        icon={<IconClose />}
                        onClick={() => {
                          globalStore.shouldShow = false
                        }}
                      />
                    }>
                      <TabPane tab="剪藏" itemKey='1'>
                        <WebClip />
                      </TabPane>
                      <TabPane tab="设置" itemKey='2'>
                        <Settings />
                      </TabPane>
                      <TabPane tab="关于" itemKey='3'>
                        <About />
                      </TabPane>
                    </Tabs>
                  }
                </Card>
              </div>
            )
            : null
        }
      </ShadowRootCtx.Provider>
    </GlobalStoreCtx.Provider>
  )
})