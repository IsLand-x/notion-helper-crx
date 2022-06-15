import { IconDelete, IconTick } from "@douyinfe/semi-icons";
import { Button, Divider, Select, Typography } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { useContext, useEffect } from 'react'
import { GlobalStoreCtx } from "~content";

function CollectingPage() {
  const globalStore = useContext(GlobalStoreCtx)

  useEffect(() => {
    const listenMouseMove = (e: MouseEvent) => {
      let hoveredEl = (e as any)?.path?.[0] as (HTMLElement | undefined)
      if (!hoveredEl) {
        return
      }
      // 防止反复增加event listener
      if (hoveredEl.classList.contains("__notion__helper__hovered__")) {
        return
      }
      for (const x of Array.from(((e as any).path as HTMLElement[]))) {
        x.classList?.remove("__notion__helper__hovered__")
      }

      const handleClick = (e: MouseEvent) => {
        // 检查冒泡路径内是否有A标签, 或者点击了Notion助手界面
        const path = ((e as any)?.path || []) as HTMLElement[]
        for (const el of Array.from(path)) {
          if (el.id === "__notion__helper__root__") {
            return
          }
          if (["A"].includes(el.tagName)) {
            console.log("[Notion Helper] Should prevent page navigate.")
            e.preventDefault()
          }
        }
        if (e.target === hoveredEl) {
          globalStore.handleSelectedDOM(hoveredEl)
          e.stopPropagation()
        }
      }

      const listenMouseLeave = (e: MouseEvent) => {
        hoveredEl.classList.remove("__notion__helper__hovered__")
        hoveredEl.removeEventListener("click", handleClick);
        (hoveredEl as any).__notion__helper__listening = false
      }

      hoveredEl.classList.add("__notion__helper__hovered__")
      if (!(hoveredEl as any).__notion__helper__listening) {
        hoveredEl.addEventListener('click', handleClick);
        (hoveredEl as any).__notion__helper__listening = true
      }
      hoveredEl.addEventListener("mouseleave", listenMouseLeave, {
        once: true
      })
    }

    document.body.addEventListener("mousemove", listenMouseMove)
    return () => {
      document.body.removeEventListener("mousemove", listenMouseMove)
    }
  }, [])

  return <>
    <div style={{ width: 300, display: 'flex', justifyContent: 'space-between' }}>
      <Button
        type="danger"
        icon={<IconDelete />}
        onClick={() => globalStore.removeAllSelectedDOM()}
      >清空</Button>
      <Button
        icon={<IconTick />}
        style={{ color: 'rgb(var(--semi-green-5))' }}
        onClick={() => {
          globalStore.setCollecting(false);
          let content = globalStore.selectedDOMArr.map(el => el.outerHTML).join('\n')
          globalStore.setFormValue({ content: content })
        }}
      >收集完成</Button>
    </div>
    <div>
      <Divider margin={8} />
      <Typography >已选择{globalStore.selectedDOMArr.length}个元素</Typography>
      <Divider margin={8} />
      <Typography><Typography.Text style={{ color: "rgb(var(--semi-blue-5))" }}>蓝色虚线</Typography.Text>表示当前元素可选择。</Typography>
      <Typography><Typography.Text style={{ color: "rgb(var(--semi-red-5))" }}>红色虚线</Typography.Text>表示当前元素可取消选择。</Typography>
      <Typography><Typography.Text style={{ color: "rgb(var(--semi-green-5))" }}>绿色实线</Typography.Text>表示当前元素已选择。</Typography>
      <Divider margin={8} />
      <Typography.Paragraph style={{ width: 300 }}>
        框线会在插件关闭之后自动消失。由于Notion API限制，剪藏内容一次不能超过1000个Block，若剪藏内容中包含代码块，每个代码块长度不能超过100行。否则会提示剪藏失败。
      </Typography.Paragraph>
    </div>
  </>
}

export default observer(CollectingPage)