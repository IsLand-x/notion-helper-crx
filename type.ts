export type SendEventType = {
  type: "saveToken",
  payload: {
    token: string
  }
} | {
  type: "saveContent",
  payload: {
    articleName: string
    href: string
    date: string
    author: string
    content: string
  }
} | {
  type: "getToken",
  payload: {}
}