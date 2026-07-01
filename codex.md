# Codex 记录

用于记录项目相关的想法、决策、进展和待办事项。

## 待办事项

- [ ]

## 工作记录

### 2026-06-30

- 创建本记录文件。
- 导入 `padavanonly/immortalwrt-mt798x-6.6` 源码到项目根目录。
- 在 MT7981 AX3000 普通版和 DAE 版预设中启用官方 `adguardhome` 包。
- 在 MT7981 AX3000 普通版和 DAE 版预设中启用 Mwan3、LuCI 管理界面及简体中文翻译。
- 增加 Cudy TR3000 v1 原厂 64M UBI 和 MOD U-Boot 112M UBI 两套专用配置、Linux 构建脚本及 GitHub Actions 工作流。

### 2026-07-01

- 找到 AdGuard Home “未集成”的原因：此前只启用了官方 `adguardhome` 后端包，并按旧决策刻意没有加入 LuCI 入口。
- 新增适配 LuCI 24.10 的 `luci-app-adguardhome`，直接管理官方小写 `adguardhome` UCI/procd 服务，提供运行状态、启停、路径设置和 Web 管理入口；避免引入会与官方服务冲突的 2020 年旧版第三方插件。
- 按上游中文 README 的完整三包结构集成 NetSpeedTest v5.2.1（`luci-app-netspeedtest`、`homebox`、`ookla-speedtest`），并固定源码提交 `0c936e9dd513b2915229871b088b85ca817f5083`，保证构建可复现。
- 加强 TR3000 构建前配置断言，同时检查 AdGuard Home LuCI、NetSpeedTest 和 Mwan3 中文界面。
- 在 Linux 区分大小写文件系统中分别展开 stock 64M 与 MOD 112M 两套 `defconfig`，确认 AdGuard Home、NetSpeedTest 三包和 Mwan3 均未被 Kconfig 丢弃。
- Mwan3 最终依赖解析为 `firewall4`、`iptables-nft`、`ip6tables-nft`、`ipset` 和 `ip-tiny`，不存在 nft/legacy provider 混装。
- 通过 JavaScript 语法、JSON、Shell 语法和 Git whitespace 静态检查；完整包编译留给仓库的 x86_64 GitHub Actions，因本地验证主机为 arm64，而此基线的 Go bootstrap 明确不支持 Linux/arm64 host。

## 上游源码基线

- 仓库：<https://github.com/padavanonly/immortalwrt-mt798x-6.6>
- 分支：`openwrt-24.10-6.6`
- 提交：`31d05c7d835d50f10597fbab0eab14258b2c17e7`
- 提交时间：`2026-06-26T17:16:22+08:00`
- 提交说明：`Merge pull request #404 from Yuzhii0718/mtk-switch`
- 导入日期：`2026-06-30`
- 说明：仅导入源码文件，未保留上游仓库的 `.git` 记录；后续同步以上述提交为比较基线。

## 重要决策

- AdGuard Home 使用 ImmortalWrt `packages` feed 的官方 `adguardhome` 包；基线版本为 `0.107.57`。
- 官方 ImmortalWrt 24.10 LuCI feed 不提供 `luci-app-adguardhome`；项目现内置一个轻量的 LuCI 24.10 原生管理入口，并继续使用 AdGuard Home 自带 Web UI 完成功能配置。
- Mwan3 使用官方 `mwan3`、`luci-app-mwan3` 和 `luci-i18n-mwan3-zh-cn`，核心包基线版本为 `2.11.16-5`。
- `luci-app-mwan3helper-chinaroute` 是可选的中国线路表辅助插件，不作为 Mwan3 基础组件默认启用。
- 当前旧固件截图显示约 57.79 MiB 可用空间，说明运行中的固件仍使用 64M UBI DTS；设备已安装 MOD U-Boot，可以切换到 112M UBI 固件。
- 修正 TR3000 U-Boot MOD 镜像定义，使其生成 U-Boot 菜单所需的 recovery ITB、sysupgrade ITB、BL2 preloader 和 FIP；此前上游定义仅生成 tar 格式 `sysupgrade.bin`，与 U-Boot 环境中的文件名及 FIT 校验不匹配。
- 用户确认设备已经安装配套 MOD U-Boot；项目默认构建目标改为 `cudy_tr3000-v1-ubootmod`（112M UBI），原厂 64M 配置仅作为备用。
- 调整 `.gitignore`，确保源码自带及后续新增的 `files/` 根文件系统覆盖内容会被项目仓库记录。

## 备注

- 暂无。
