# 上游同步说明

本仓库从 `padavanonly/immortalwrt-mt798x-6.6` **按文件导入**，没有保留上游 `.git` 历史，因此不能 `git pull`。只摘对 Cudy TR3000 有用的通用修复，不合并其他机型。

## 当前基线

| 项 | 值 |
|---|---|
| 仓库 | https://github.com/padavanonly/immortalwrt-mt798x-6.6 |
| 分支 | `openwrt-24.10-6.6` |
| 已审阅到 | `ec9ef10efc65da1e6d1de4e2c043c0e13d08eed8`（2026-07-23） |
| 导入基线 | `31d05c7d835d50f10597fbab0eab14258b2c17e7`（2026-06-26） |
| 上次同步 | 2026-09-07，只摘 TR3000 相关提交 |

下次同步时，用下面命令看基线之后有没有新东西：

```text
https://github.com/padavanonly/immortalwrt-mt798x-6.6/compare/ec9ef10efc65da1e6d1de4e2c043c0e13d08eed8...openwrt-24.10-6.6
```

## 下次怎么做

1. 打开上面的 compare，列出新增提交和文件。
2. **跳过** 其他机型：`target/linux/mediatek/dts/*` 新 DTS、`filogic.mk` 里非 `cudy_tr3000*` 的 `Device/`、`01_leds` / `02_network` / `11_fix_wifi_mac` / `platform.sh` / `uboot-envtools` 里的新 `board` 分支。
3. **跳过** 国家码表微调（例如 `mtwifi_defs.lua` 的 `FR`），除非 TR3000 实际用到该国家。
4. **要看** 这些路径（TR3000 会编进固件）：
   - `package/mtk/drivers/mt_wifi/patches/`
   - `package/mtk/applications/mtwifi-cfg/`
   - `package/mtk/applications/luci-app-mtwifi-cfg/`
   - `package/network/utils/iwinfo/`
   - `package/network/config/netifd/`
   - `package/network/services/uhttpd/`
   - `target/linux/mediatek/dts/mt7981b-cudy-tr3000*`
   - `target/linux/mediatek/image/filogic.mk` 里 `cudy_tr3000*`
   - `target/linux/mediatek/filogic/base-files/` 里带 `cudy,tr3000` 的分支
5. `mt_wifi` 补丁本地已经占用 `002`–`027`。上游若再给 `017`–`027` 同号文件，**不要覆盖**，接到 `028` 起，并在补丁头注明上游原文件名和 PR/commit。
6. 本仓库在 `filogic.mk`、`platform.sh`、DTS 上有 `cudy,tr3000-mod` 定制。同步这些文件时按行摘，不要整文件覆盖。
7. 改完后：把本页「已审阅到」改成当时上游 `openwrt-24.10-6.6` 的 HEAD，并在下面「同步记录」加一节。

## 2026-09-07 已摘入

对比范围：`31d05c7...ec9ef10`，上游共 12 个提交。

| 上游 | 本地处理 |
|---|---|
| PR #409：`iwinfo` / `mt_wifi` 信道分析、扫描丢包，以及配套的 `uhttpd` ubus POST 上限 | 已摘。`mt_wifi` 补丁改名为 `025` / `026` / `027` |
| PR #417：`ifdown` 权限（应是指向 `ifup` 的可执行符号链接） | 已修。导入时 `ifdown` 被落成 644 普通文件，内容只有 `ifup` |
| PR #409：不再用 `luci-app-mtwifi-cfg` 覆盖 `luci-mod-status.json` | 已摘。官方 LuCI 24.10 的 Channel Analysis 已对任意 `wifi-device` 开放。uci-defaults 会删掉旧镜像里仍限制 `mac80211` 的覆盖文件 |
| PR #405：法国频段 `FR` `{1,2}` → `{1,1}` | **未摘** |
| PR #415：Nradio C8-668 / C8-668GL | **未摘** |
| Netcore N60 Pro LED / USB LED | **未摘** |

本地相对上游的额外改动：

- `025-add-vht-op-to-sitesurvey.patch` 在 013 补丁之后加大 `LINE_LEN`，避免 SiteSurvey 行被截断。
- `luci-app-mtwifi-cfg` uci-defaults 增加删除旧 `luci-mod-status.json` 覆盖的逻辑，避免保留配置升级后菜单仍被挡住。

## 编号对照

| 上游补丁 | 本仓库 |
|---|---|
| `017-add-vht-op-to-sitesurvey.patch` | `025-add-vht-op-to-sitesurvey.patch` |
| `018-add-cen-ch-oid.patch` | `026-add-cen-ch-oid.patch` |
| `019-dwell-active-only.patch` | `027-dwell-active-only.patch` |
| `001-add-ubus-max-post-size-env.patch` | 同名（`uhttpd`，本地原先没有补丁） |
