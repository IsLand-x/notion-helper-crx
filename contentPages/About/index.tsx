import { IllustrationIdle, IllustrationIdleDark } from "@douyinfe/semi-illustrations";
import { Button, Empty, Notification, Popover, Tooltip, Typography } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { useContext, useState } from "react";
import { ShadowRootCtx } from "~content";
import packageJson from '~package.json'

const qr = new URL("./qr.jpg", import.meta.url)

export default observer(() => {
  const [clickCount, setClickCount] = useState(1)
  const shadowRoot = useContext(ShadowRootCtx)
  return <div style={{ width: 300, paddingTop: 20 }}>
    <Empty
      image={<IllustrationIdle style={{ width: 150, height: 150 }} />}
      darkModeImage={<IllustrationIdleDark style={{ width: 150, height: 150 }} />}
      description={<Typography.Text size="small">
        Notion助手(Chrome插件版) | Version {packageJson.version} <br />
        Copyright 2022 @IsLand All Rights Reserved.
      </Typography.Text>}
      style={{ width: 300, margin: '0 auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Popover
          position="top"
          getPopupContainer={() => shadowRoot.querySelector("#__notion__helper__root__")}
          content={
            // @ts-ignore
            <img src={qr} style={{ width: 300, height: 300, verticalAlign: "bottom" }}></img>
          }
          style={{ overflow: 'hidden' }}
        >
          <Button
            theme="solid"
            type="primary"
            onClick={() => {
              Notification.success({
                icon: clickCount > 3 ? '🤤' : '🍗',
                title: clickCount > 3 ? '别加了，撑死啦~' : `给作者加${clickCount}个鸡腿！`
              })
              setClickCount(c => c + 1)
            }}
          >给作者加鸡腿🍗</Button>
        </Popover>
        <Tooltip
          content="主页中包含常见问题、ios捷径、微信小程序、使用教程、用户群二维码等。"
          getPopupContainer={() => shadowRoot.querySelector("#__notion__helper__root__")}
        >
          <Button theme="solid" type="primary" onClick={() => {
            window.open("https://island-x.notion.site/Notion-ee3600a5c08e45ae8572e3e70bc27cec")
          }}>主页</Button>
        </Tooltip>
      </div>
    </Empty>
  </div>
})