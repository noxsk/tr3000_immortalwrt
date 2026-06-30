#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "错误：ImmortalWrt 必须在 Linux 的区分大小写文件系统中编译。" >&2
  echo "当前系统不能直接构建，请使用 GitHub Actions 或 Linux 虚拟机。" >&2
  exit 1
fi

# GNU packages which probe mknod deliberately reject configure runs as root.
# Root builds are common in disposable cloud VMs and containers, so make the
# required opt-in available to every configure subprocess spawned by make.
if (( EUID == 0 )); then
  export FORCE_UNSAFE_CONFIGURE=1
  echo "提示：检测到 root 构建，已启用 GNU configure root 兼容模式。" >&2
fi

PROFILE="${PROFILE:-ubootmod}"
case "$PROFILE" in
  stock)
    DEFCONFIG="defconfig/cudy-tr3000-v1-stock.config"
    DEVICE_SYMBOL="CONFIG_TARGET_DEVICE_mediatek_filogic_DEVICE_cudy_tr3000-v1=y"
    ;;
  ubootmod)
    DEFCONFIG="defconfig/cudy-tr3000-v1-ubootmod.config"
    DEVICE_SYMBOL="CONFIG_TARGET_DEVICE_mediatek_filogic_DEVICE_cudy_tr3000-v1-ubootmod=y"
    ;;
  *)
    echo "错误：PROFILE 只能是 stock 或 ubootmod。" >&2
    exit 1
    ;;
esac

JOBS="${JOBS:-$(nproc)}"

if [[ "${SKIP_FEEDS:-0}" != "1" ]]; then
  ./scripts/feeds update -a
  ./scripts/feeds install -a
fi

cp -f "$DEFCONFIG" .config
make defconfig

grep -qxF "$DEVICE_SYMBOL" .config
grep -qxF 'CONFIG_PACKAGE_adguardhome=y' .config
grep -qxF 'CONFIG_PACKAGE_mwan3=y' .config
grep -qxF 'CONFIG_PACKAGE_luci-app-mwan3=y' .config

make download -j"$JOBS"

if ! make -j"$JOBS"; then
  echo "并行构建失败，使用单线程详细日志重试。" >&2
  make -j1 V=s
fi

echo
echo "构建完成，固件目录："
echo "$ROOT_DIR/bin/targets/mediatek/filogic/"
