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
- 官方 ImmortalWrt 24.10 LuCI feed 不提供 `luci-app-adguardhome`，因此不引入第三方 LuCI 包；管理界面使用 AdGuard Home 自带 Web UI。
- Mwan3 使用官方 `mwan3`、`luci-app-mwan3` 和 `luci-i18n-mwan3-zh-cn`，核心包基线版本为 `2.11.16-5`。
- `luci-app-mwan3helper-chinaroute` 是可选的中国线路表辅助插件，不作为 Mwan3 基础组件默认启用。
- 当前旧固件截图显示约 57.79 MiB 可用空间，说明运行中的固件仍使用 64M UBI DTS；设备已安装 MOD U-Boot，可以切换到 112M UBI 固件。
- 修正 TR3000 U-Boot MOD 镜像定义，使其生成 U-Boot 菜单所需的 recovery ITB、sysupgrade ITB、BL2 preloader 和 FIP；此前上游定义仅生成 tar 格式 `sysupgrade.bin`，与 U-Boot 环境中的文件名及 FIT 校验不匹配。
- 用户确认设备已经安装配套 MOD U-Boot；项目默认构建目标改为 `cudy_tr3000-v1-ubootmod`（112M UBI），原厂 64M 配置仅作为备用。
- 调整 `.gitignore`，确保源码自带及后续新增的 `files/` 根文件系统覆盖内容会被项目仓库记录。

## 备注

- 暂无。
