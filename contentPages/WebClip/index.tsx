import { Button, ButtonGroup, Empty, Form, Tooltip } from "@douyinfe/semi-ui"
import { useCallback, useContext, useState } from "react"
import { GlobalStoreCtx, ShadowRootCtx } from "~content"
import { observer } from "mobx-react-lite"
import { IconHelpCircle, IconTickCircle, IconUploadError } from "@douyinfe/semi-icons"
import { IllustrationFailure, IllustrationFailureDark, IllustrationSuccess, IllustrationSuccessDark } from "@douyinfe/semi-illustrations"
const { Input, TextArea, DatePicker } = Form

function _ClipInfo() {
  const shadowRoot = useContext(ShadowRootCtx)
  const globalStore = useContext(GlobalStoreCtx)
  const getContainer = useCallback(() =>
    shadowRoot.querySelector("#__notion__helper__root__") as HTMLElement,
    [shadowRoot]
  )
  return <Form
    style={{ width: 300 }}
    initValues={globalStore.formValue}
    onChange={(e) => {
      globalStore.setFormValue(e.values)
    }}
    onSubmit={e => {
      globalStore.saveContent()
    }}
  >
    <Input placeholder="请输入剪藏内容标题" field="articleName" label="标题（Name）" showClear />
    <Input placeholder="请输入剪藏内容网址" field="href" label="网址（Href）" showClear />
    <Input placeholder="请输入作者" field="author" label="作者（Author）" showClear />
    <DatePicker style={{ width: '100%' }} type="dateTime" placeholder="请选择文章发布时间" field="date" label="文章发布时间（Date）" showClear getPopupContainer={getContainer} />
    <TextArea
      placeholder="请输入剪藏内容"
      field="content"
      showClear
      label={{
        text: "剪藏内容",
        extra: <Tooltip
          getPopupContainer={
            () => shadowRoot.querySelector("#__notion__helper__root__")
          }
          content="内容选取功能会选择HTML标签，服务端会自动解析。亦可自己输入任何文本，将Notion助手作为笔记使用。"
        >
          <IconHelpCircle />
        </Tooltip>
      }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button onClick={() => { globalStore.setCollecting(true) }} disabled={globalStore.isContentSaving}>内容选取</Button>
      <Button theme="solid" type="primary" htmlType="submit" loading={globalStore.isContentSaving}>保存</Button>
    </div>
  </Form>
}

const ClipInfo = observer(_ClipInfo)

function _SaveStatus() {
  const globalStore = useContext(GlobalStoreCtx)

  return <div style={{ width: 300, paddingTop: 20 }}>
    {
      globalStore.contentSaveErrMsg === 'ok'
        ?
        <Empty
          title={'剪藏成功'}
          image={<IllustrationSuccess style={{ width: 150, height: 150 }} />}
          darkModeImage={<IllustrationSuccessDark style={{ width: 150, height: 150 }} />}
          style={{ width: 300, margin: '0 auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-evenly', width: 300 }}>
            <Button
              type="danger"
              theme="solid"
              onClick={() => globalStore.shouldShow = false}
            >
              退出
            </Button>
            <Button
              type="primary"
              theme="solid"
              onClick={() => {
                globalStore.resetFormValue()
              }}
            >
              继续剪藏
            </Button>
          </div>
        </Empty>
        :
        <Empty
          image={<IllustrationFailure style={{ width: 150, height: 150 }} />}
          darkModeImage={<IllustrationFailureDark style={{ width: 150, height: 150 }} />}
          title={'剪藏失败'}
          description={globalStore.contentSaveErrMsg}
          style={{ width: 300, margin: '0 auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="warning"
              onClick={() => {
                globalStore.saveContent()
              }}
              loading={globalStore.isContentSaving}
              theme="solid"
            >重试</Button>
          </div>
        </Empty>
    }
  </div>
}

const SaveStatus = observer(_SaveStatus)

function WebClip() {
  const globalStore = useContext(GlobalStoreCtx)
  return globalStore.contentSaveErrMsg === null
    ? <ClipInfo />
    : <SaveStatus />
}

export default observer(WebClip)