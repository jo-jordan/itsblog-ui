import pkg from '../../package.json'

// Everything visitors see about the site owner lives here.
export default {
  title: "It's blog",
  domain: 'edgeless.me',
  version: pkg.version,
  since: 2020,
  owner: {
    name: 'Mao Yidan',
    tagline: '程序员 · 写点笔记'
  },
  email: 'jojordanbless@gmail.com',
  links: [
    { label: '主页', value: 'edgeless.me', href: 'https://edgeless.me' },
    { label: 'GitHub', value: 'jo-jordan', href: 'https://github.com/jo-jordan' }
  ],
  sourceUrl: 'https://github.com/jo-jordan/itsblog-ui'
}
