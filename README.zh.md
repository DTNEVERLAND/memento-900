<div align="center">

# Memento 900

### 900 个月,一张网格。

一款隐私优先、本地优先的人生记录工具。把你的一生具象成
**30 × 30 = 900 个月的网格**——提醒自己,时间是有限的。

*灵感来自"人生不过 900 个月"的概念:一整段人生,画成 900 个方格。*

**简体中文** · [English](README.md)

<br />

<img src="docs/screenshots/grid.png" alt="900 个月的网格" width="800" />

<br />

<img src="docs/screenshots/panel.png" alt="记录一个时刻" width="800" />

</div>

---

## 为什么

我们总以为时间还很多。Memento 900 静静地提出异议。
每一个方格是约 75 年人生中的一个月。已度过的格子变暗,当下那一格在发光,
其余的还在等待。每过一个月,就有一格变成过去——一个温柔、循环的提醒:
好好过这段时间。

它**不**是为了把你黏在 app 里设计的。你看一眼,然后就去生活。
没有让人焦虑的连续打卡,没有上瘾陷阱,不催不扰。

## 功能

- 🗓️ **900 个月网格** —— 一眼看尽你的一生,由出生日期精确计算
  (周年精确、闰年安全)。
- 📝 **记录任何一个月** —— 每个月可记录多个"时刻",含文字、心情、标签、照片。
- 🔒 **私密 · 本地优先** —— 所有数据存在你设备上的本地 SQLite 文件里。
  无账号、无服务器、无云、无追踪。
- 🌐 **双语** —— 中文 / English,随时切换。
- 🪶 **极轻量** —— 约 1.7 MB 安装包,约 27 MB 内存。基于 Tauri 2,而非 Electron。

## 下载

从 **[Releases 页面](../../releases/latest)** 获取最新安装包 →
`Memento 900_x.y.z_x64-setup.exe`(Windows 64 位)。

你的数据保存在:
`%APPDATA%\com.memento900.app\memento900.db`
换电脑时,把这个文件拷过去即可。

> Windows SmartScreen 可能提示"未知发布者"(因为 app 未做代码签名)。
> 点 **更多信息 → 仍要运行** 即可。源码在本仓库完全公开。

## 技术栈

| 层 | 选型 |
|------|------|
| 外壳 | [Tauri 2](https://tauri.app)(Rust) |
| 界面 | React 18 + TypeScript + Tailwind CSS |
| 存储 | SQLite(`tauri-plugin-sql`) |
| 动效 | Framer Motion |
| 测试 | Vitest(日期→月份引擎有完整单元测试) |

## 开发

```bash
npm install
npm run dev          # 浏览器开发(localStorage 后端)
npm test             # 运行时间引擎单元测试
npm run tauri dev    # 运行桌面 app(SQLite 后端)
```

### 构建安装包(Windows)

需要 Rust + MSVC Build Tools,然后:

```bash
npm run tauri build
```

安装包输出到
`src-tauri/target/release/bundle/nsis/`。

## 许可

[MIT](LICENSE) —— 随意使用,保留版权声明即可。

---

<div align="center">
<sub>记住,你只有 900 个月。好好用。</sub>
</div>
