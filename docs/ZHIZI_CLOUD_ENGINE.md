# 智子云远程算力

GoAgent 支持通过智子围棋电脑版内置的 `zz-ikatago` 连接智子云算力。它和普通 iKataGo world 账号不是同一条登录路径：GoAgent 会启动本机 `zz-ikatago`，等待远端 KataGo 进入 GTP ready 状态，然后用 `kata-analyze` 读取候选点、胜率、目差和 PV。

```text
GoAgent -> 本机 zz-ikatago -> 智子云远程 KataGo -> GTP kata-analyze
```

## 适合谁

- 本机 KataGo 速度慢，希望借用智子云算力的用户。
- 已安装并登录“智子围棋电脑版”的用户。
- 想保持 GoAgent 老师讲解、棋谱库、知识库和胜率图流程不变，只把分析引擎换成远程算力的用户。

## 设置方式

在 GoAgent 设置页打开“分析引擎”：

1. 引擎模式选择 `智子云远程算力：zz-ikatago`。
2. 填写 `zz-ikatago 路径`。
   - macOS 示例：
     `/Applications/智子围棋电脑版.app/Contents/Resources/data/zz-ikatago`
   - 如果应用在下载目录，路径可能类似：
     `/Users/你的用户名/Downloads/智子围棋电脑版.app/Contents/Resources/data/zz-ikatago`
3. Token 通常可以留空。已登录智子围棋客户端时，`zz-ikatago` 会使用自己的登录状态。
4. 附加参数一般留空；只有你明确知道智子客户端需要额外参数时再填写。

也可以保持 `自动` 模式，勾选“本机测速低于阈值时使用智子云”。这样本机 KataGo 可用且速度足够时仍走本机，速度太慢时才切到智子云。

## 和 iKataGo 的区别

- iKataGo 路径使用 `ikatago -- analysis`，面向普通 iKataGo world / 自建远程服务。
- 智子云路径使用 `zz-ikatago` 的 GTP / `kata-analyze` 输出，适配智子围棋电脑版的远程算力。

如果你把智子账号密码直接填到 iKataGo world，会出现用户配置 404 或无法登录，这是两套远程服务入口不同导致的。

## 隐私边界

只有在以下情况，GoAgent 才会把局面发送到智子云：

- 引擎模式明确选择 `智子云远程算力：zz-ikatago`。
- 或者在 `自动` 模式下启用了“本机测速低于阈值时使用智子云”，且本机测速低于阈值。

GoAgent 不会把智子 token 写入普通设置文件，也不会在日志中打印 token。

## 故障排查

- `智子云未配置完整`：检查 `zz-ikatago 路径` 是否填写。
- `智子云 KataGo 启动超时`：先打开智子围棋电脑版确认登录状态，再重试。
- `智子云 GTP 命令失败`：可能是远端引擎尚未 ready、账号状态异常，或智子客户端版本不兼容。
- 如果本机 KataGo 可用，且不是强制智子云模式，GoAgent 会在智子云失败后回退本机 KataGo。
