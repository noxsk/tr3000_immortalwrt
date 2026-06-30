# Cudy TR3000 编译说明

## 当前设备应该选择哪个配置

TR3000 的 SPI-NAND 物理容量是 128 MB，但固件存在两种分区布局：

- `stock`：原厂布局，Linux UBI 区为 64 MiB。当前旧固件截图显示约 57.79 MiB 可用空间，说明它仍在使用此 DTS 布局。
- `ubootmod`：配套 MOD U-Boot 的扩容布局，Linux UBI 区为 112 MiB。当前设备已经确认安装本项目配套 MOD U-Boot，因此项目默认使用此配置。

不要在原厂布局上强制刷入 112M 固件。`256mb` 配置适用于另一种 256 MB 闪存硬件，也不能使用。

## 已准备的配置

- `defconfig/cudy-tr3000-v1-stock.config`：原厂 64M UBI 布局，只编译 Cudy TR3000 v1。
- `defconfig/cudy-tr3000-v1-ubootmod.config`：MOD U-Boot 112M UBI 布局，只编译 Cudy TR3000 v1 MOD。

两套配置均包含 MTK 私有无线驱动、硬件加速、AdGuard Home、Mwan3、Mwan3 LuCI 管理界面和简体中文翻译。

## Linux 本地编译

建议使用 Debian 11/12 或 Ubuntu 22.04，至少准备 4 核 CPU、8 GB 内存和 30 GB 可用磁盘。文件系统必须区分大小写；不要使用 macOS 当前工作目录直接编译。

安装依赖可参考项目根目录的 `README.md`。进入源码目录后执行：

```bash
chmod +x build-tr3000.sh
./build-tr3000.sh
```

建议使用普通用户编译。如果在一次性云主机或容器中以 `root` 运行，脚本会自动启用 GNU configure 的 root 兼容模式，无需手动设置 `FORCE_UNSAFE_CONFIGURE`。

以上命令默认构建 MOD U-Boot 112M UBI 布局。重复构建且 feeds 已经更新时，可以执行：

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

普通版文件名包含 `cudy_tr3000-v1-squashfs-sysupgrade.bin`；MOD 版文件名包含 `cudy_tr3000-v1-ubootmod-squashfs-sysupgrade.itb`。

## GitHub Actions 编译

推送代码后，在 GitHub 仓库的 **Actions → Build Cudy TR3000 → Run workflow** 中选择：

- `ubootmod`：默认，适用于当前已经安装 MOD U-Boot 的设备。
- `stock`：仅在需要恢复原厂 64M 固件布局时选择。

任务完成后，从该次运行的 Artifacts 下载 `cudy-tr3000-stock` 或 `cudy-tr3000-ubootmod`。

## 刷写注意事项

从其他 OpenWrt/LEDE 分支切换到本固件前先备份配置和 ART/Factory、bdinfo、BL2、FIP 等关键分区。首次跨分支升级建议不要保留配置。

原厂布局优先在 LuCI 的“备份与更新”中刷写普通 `sysupgrade.bin`。不要勾选强制升级，也不要刷入文件名带 `ubootmod` 的镜像。

配套 MOD U-Boot 支持从 TFTP 写入生产系统：电脑地址使用 `192.168.1.254`，U-Boot 地址为 `192.168.1.1`，菜单项 4 会加载并写入 `ubootmod-squashfs-sysupgrade.itb`。菜单项 6 和 7 分别写入 FIP 与 BL2，不属于普通固件升级，误操作可能导致设备无法启动。
