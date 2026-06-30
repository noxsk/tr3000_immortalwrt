# Cudy TR3000 编译说明

## 当前设备应该选择哪个配置

TR3000 的 SPI-NAND 物理容量是 128 MB，但当前设备的第三方多布局 U-Boot 支持多种分区方案：

- `stock`：原厂布局，Linux UBI 区为 64 MiB，仅用于原厂 U-Boot/分区布局。
- `mod112`：第三方多布局 U-Boot 的 `mod-112m` 方案，Linux UBI 从 `0x5c0000` 开始、大小为 `0x7000000`（112 MiB），设备 ID 为 `cudy,tr3000-mod`。这是当前设备应使用的默认配置。

不要在原厂布局上强制刷入 112M 固件。第三方 U-Boot 的 `maximum-114m` 与本项目的 `mod-112m` 也不是同一个目标；刷写时必须选择 `mod-112m`。`256mb` 配置适用于另一种 256 MB 闪存硬件，不能使用。

## 已准备的配置

- `defconfig/cudy-tr3000-v1-stock.config`：原厂 64M UBI 布局，只编译 Cudy TR3000 v1。
- `defconfig/cudy-tr3000-mod-112m.config`：第三方多布局 U-Boot 的 112M UBI 布局，只编译 `cudy,tr3000-mod`。

两套配置均包含 MTK 私有无线驱动、硬件加速、AdGuard Home、Mwan3、Mwan3 LuCI 管理界面和简体中文翻译。

`cudy_tr3000-v1-ubootmod` 是另一套官方 OpenWrt U-Boot/FIT 布局，产物为 `.itb`。它与当前第三方多布局 U-Boot 不兼容，因此 GitHub Actions 不会构建或上传该镜像。

## Linux 本地编译

建议使用 Debian 11/12 或 Ubuntu 22.04，至少准备 4 核 CPU、8 GB 内存和 30 GB 可用磁盘。文件系统必须区分大小写；不要使用 macOS 当前工作目录直接编译。

安装依赖可参考项目根目录的 `README.md`。进入源码目录后执行：

```bash
chmod +x build-tr3000.sh
./build-tr3000.sh
```

建议使用普通用户编译。如果在一次性云主机或容器中以 `root` 运行，脚本会自动启用 GNU configure 的 root 兼容模式，无需手动设置 `FORCE_UNSAFE_CONFIGURE`。

以上命令默认构建第三方多布局 U-Boot 的 `mod-112m` 固件。重复构建且 feeds 已经更新时，可以执行：

```bash
SKIP_FEEDS=1 ./build-tr3000.sh
```

如需改为构建原厂 64M 版本：

```bash
PROFILE=stock ./build-tr3000.sh
```

构建结果位于：

```text
bin/targets/mediatek/filogic/
```

原厂版文件名包含 `cudy_tr3000-v1-squashfs-sysupgrade.bin`；112M MOD 版文件名包含 `cudy_tr3000-mod-squashfs-sysupgrade.bin`。

构建脚本会在结束前自动检查 sysupgrade 归档、`BOARD`、设备树 `compatible` 和 UBI 分区边界。任一项不是预期值都会使构建失败，避免上传“能编译但不能刷”的固件。

## GitHub Actions 编译

推送代码后，在 GitHub 仓库的 **Actions → Build Cudy TR3000 → Run workflow** 中选择：

- `mod112`：默认，适用于当前第三方多布局 U-Boot，并对应网页中的 `mod-112m`。
- `stock`：仅在需要恢复原厂 64M 固件布局时选择。

任务完成后，从该次运行的 Artifacts 下载 `cudy-tr3000-mod112` 或 `cudy-tr3000-stock`。压缩包中只包含对应布局的可刷写固件和它自己的 `sha256sums`，不会混入 `.itb`、FIP 或 BL2。

## 刷写注意事项

从其他 OpenWrt/LEDE 分支切换到本固件前先备份配置和 ART/Factory、bdinfo、BL2、FIP 等关键分区。首次跨分支升级建议不要保留配置。

当前 U-Boot 网页显示的布局是 `maximum-114m`。首次切换到本项目固件时，建议进入 U-Boot 网页，将 MTD 布局选为 `mod-112m`，再上传 `cudy_tr3000-mod-squashfs-sysupgrade.bin`。不要选择 `default` 或 `maximum-114m`，不要上传 `.itb`。

刷入本项目的 `mod112` 固件后，后续版本可在 LuCI 的“备份与升级”中正常刷写同名目标的 `sysupgrade.bin`。设备校验应显示支持 `cudy,tr3000-mod`；如果仍提示设备不支持，不要勾选“强制刷写”。

不要使用 U-Boot 页面中的“更新 U-Boot”功能，也不要刷写 FIP 或 BL2。它们不是普通固件升级，误操作可能导致设备无法启动。
