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
3. 填写智子云账号和密码，点击“登录并连接智子云”。
   - GoAgent 会调用智子云登录接口获取 token。
   - 登录成功后，GoAgent 会把 token 保存到本地加密存储。
   - 后续只需要启动 GoAgent，不需要先启动智子围棋电脑版。
4. Token 通常不需要手动填写。只有你已经从其它方式拿到了 token，才使用“高级：Token”。
5. 附加参数一般留空；只有你明确知道智子客户端需要额外参数时再填写。

也可以保持 `自动` 模式，勾选“本机测速低于阈值时使用智子云”。这样本机 KataGo 可用且速度足够时仍走本机，速度太慢时才切到智子云。

## 和 iKataGo 的区别

- iKataGo 路径使用 `ikatago -- analysis`，面向普通 iKataGo world / 自建远程服务。
- 智子云路径使用 `zz-ikatago` 的 GTP / `kata-analyze` 输出，适配智子围棋电脑版的远程算力。

如果你把智子账号密码直接填到 iKataGo world，会出现用户配置 404 或无法登录，这是两套远程服务入口不同导致的。

## 隐私边界

只有在以下情况，GoAgent 才会把局面发送到智子云：

- 引擎模式明确选择 `智子云远程算力：zz-ikatago`。
- 或者在 `自动` 模式下启用了“本机测速低于阈值时使用智子云”，且本机测速低于阈值。

GoAgent 不会把智子 token 写入普通设置文件，也不会在日志中打印 token。智子云密码只用于本次登录请求；登录成功后 GoAgent 保存 token，而不是长期保存密码。

## 故障排查

- `智子云未配置完整`：检查 `zz-ikatago 路径` 是否填写。
- `账号或密码不正确`：重新输入智子云账号密码。注意这不是普通 iKataGo world 账号。
- `智子云 KataGo 启动超时`：检查 token 是否有效，或先在 GoAgent 中重新登录。
- `智子云 GTP 命令失败`：可能是远端引擎尚未 ready、账号状态异常，或智子客户端版本不兼容。
- 如果本机 KataGo 可用，且不是强制智子云模式，GoAgent 会在智子云失败后回退本机 KataGo。
