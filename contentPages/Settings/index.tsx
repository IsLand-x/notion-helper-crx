import { Button, Form, Tooltip, Typography } from "@douyinfe/semi-ui";
import { IconHelpCircle } from '@douyinfe/semi-icons'
import { useContext, useEffect, useRef } from "react";
import { GlobalStoreCtx, ShadowRootCtx } from '../../content'
import { observer } from "mobx-react-lite";

const Input = Form.Input
const Text = Typography.Text

function UserBinding() {
  const formRef = useRef<any>()
  const globalStore = useContext(GlobalStoreCtx)
  useEffect(() => {
    formRef.current.setValue('token', globalStore.token)
  }, [globalStore.token])
  const shadow = useContext(ShadowRootCtx)
  return <div>
    <Form
      style={{ width: 300 }}
      initValues={{
        token: globalStore.token
      }}
      getFormApi={formApi => formRef.current = formApi}
      onSubmit={(e) => globalStore.setToken(e.token)}
    >
      <Input
        field="token"
        label={{
          text: "Integration Token",
          extra: <Tooltip
            getPopupContainer={
              () => shadow.querySelector("#__notion__helper__root__")
            }
            content="若未在Notion助手微信小程序中绑定，请先在微信小程序中绑定。之后将绑定的Token粘贴到此处即可。若有仍有问题，请到Notion助手主页加用户群。"
          >
            <IconHelpCircle />
          </Tooltip>
        }}
        showClear
      />
      <div
        style={
          {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }
      >
        <Text link={{
          href: "https://island-x.notion.site/Notion-ee3600a5c08e45ae8572e3e70bc27cec",
          target: '_blank'
        }}>
          跳转到Notion助手首页
        </Text>
        <Button
          theme="solid"
          htmlType="submit"
          loading={globalStore.isSettingToken}
        >保存</Button>
      </div>
    </Form>
  </div>
}

export default observer(UserBinding)