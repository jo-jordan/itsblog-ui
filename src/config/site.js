import { version } from '../../package.json'

// Everything visitors see about the site owner lives here. Text that differs
// by language is written as { 'zh-CN': …, en: … } and shown through localize().
export default {
  title: "It's blog",
  domain: 'edgeless.me',
  version,
  since: 2020,
  owner: {
    name: 'Mao Yidan',
    tagline: { 'zh-CN': '程序员 · 写点笔记', en: 'Programmer · occasional notes' }
  },
  email: 'jojordanbless@gmail.com',
  links: [
    { label: { 'zh-CN': '主页', en: 'Home page' }, value: 'edgeless.me', href: 'https://edgeless.me' },
    { label: 'GitHub', value: 'jo-jordan', href: 'https://github.com/jo-jordan' }
  ],
  sourceUrl: 'https://github.com/jo-jordan/itsblog-ui'
}
