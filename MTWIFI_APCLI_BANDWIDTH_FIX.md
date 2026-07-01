# MT7981 APCLI 与本地 AP 带宽解耦

## 问题

在 MT7981 的 5 GHz 射频同时运行本地 AP（`rax0`）与 APCLI
（`apclix0`）时，APCLI 连接到 40 MHz 上游后，本地 AP 也会从用户配置的
80/160 MHz 降到 40 MHz。LuCI 中仍保留 80/160 MHz 配置，但关联客户端只能
协商到约 573 Mbit/s。

实机验证：禁用 APCLI 后，本地 AP 会立即恢复 160 MHz / 2401 Mbit/s。

## 根因

`operate_loader_phy()` 会先为 APCLI 生成符合上游能力的运行参数，再把这组参数
复制给同频段的其他 `wifi_dev`。因此 APCLI 的 20/40 MHz 运行宽度覆盖了本地
AP 自己的设备级带宽配置。

## 修改

仅修改：

`package/mtk/drivers/mt_wifi/src/mt_wifi/embedded/mgmt/be_phy.c`

- APCLI 仍按上游 AP 的实际宽度运行，不改动连接和换信道逻辑。
- APCLI 触发换信道时，从本地 AP 自己的配置重新计算其运行宽度。
- 射频资源采用 APCLI 与本地 AP 所需的最大合法宽度。
- 信道法规能力仍由原有 `phy_freq_adjust()` 处理：
  - 本地 AP 配置 80 MHz 时保持 80 MHz；
  - 本地 AP 配置 160 MHz，但 APCLI 跳到不支持 160 MHz 的 5.8 GHz 信道时，
    自动回退到该信道允许的最大宽度（通常为 80 MHz）；
  - APCLI 自身可以继续使用上游的 20/40/80 MHz 宽度。

没有修改 UCI、LuCI、无线配置生成、APCLI 扫描/漫游或 DFS 逻辑。

## 验证项目

1. 本地 AP=80 MHz，APCLI 上游=40 MHz：本地客户端应保持 80 MHz。
2. 本地 AP=160 MHz，APCLI 位于支持 160 MHz 的信道：本地客户端应保持
   160 MHz。
3. 本地 AP=160 MHz，APCLI 跳到仅支持 80 MHz 的 5.8 GHz 信道：本地客户端
   应回退到 80 MHz，而不是 40 MHz。
4. 禁用 APCLI：本地 AP 行为应与修改前一致。
5. APCLI 换信道、断线重连及 DFS 信道切换应正常。

## 回退

还原 `be_phy.c` 中带有 “APCLI may use a narrower bandwidth” 和
“Do not copy an APCLI's negotiated” 注释的两处逻辑，并删除辅助函数
`phy_freq_get_target_oper()` 即可。
