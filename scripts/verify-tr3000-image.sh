#!/usr/bin/env bash

set -Eeuo pipefail

if (( $# != 4 )); then
	printf '用法：%s <固件> <BOARD> <compatible> <UBI大小十六进制>\n' "$0" >&2
	exit 2
fi

IMAGE="$1"
EXPECTED_BOARD="$2"
EXPECTED_COMPATIBLE="$3"
EXPECTED_UBI_SIZE="${4#0x}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

find_tool() {
	local tool="$1"
	local candidate

	if command -v "$tool" >/dev/null 2>&1; then
		command -v "$tool"
		return
	fi

	for candidate in \
		"$ROOT_DIR/staging_dir/host/bin/$tool" \
		"$ROOT_DIR/staging_dir/hostpkg/bin/$tool"; do
		if [[ -x "$candidate" ]]; then
			printf '%s\n' "$candidate"
			return
		fi
	done

	printf '错误：找不到校验工具 %s。\n' "$tool" >&2
	exit 1
}

[[ -f "$IMAGE" ]] || {
	printf '错误：固件不存在：%s\n' "$IMAGE" >&2
	exit 1
}

DUMPIMAGE="$(find_tool dumpimage)"
FDTGET="$(find_tool fdtget)"
FWTOOL="$(find_tool fwtool)"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/tr3000-image.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT

ARCHIVE_DIR="sysupgrade-${EXPECTED_BOARD}"
CONTROL_PATH="$ARCHIVE_DIR/CONTROL"
KERNEL_PATH="$ARCHIVE_DIR/kernel"
ROOTFS_PATH="$ARCHIVE_DIR/root"

tar -tf "$IMAGE" | grep -xF "$CONTROL_PATH" >/dev/null
tar -tf "$IMAGE" | grep -xF "$KERNEL_PATH" >/dev/null
tar -tf "$IMAGE" | grep -xF "$ROOTFS_PATH" >/dev/null
tar -xOf "$IMAGE" "$CONTROL_PATH" | grep -xF "BOARD=$EXPECTED_BOARD" >/dev/null
tar -xOf "$IMAGE" "$KERNEL_PATH" > "$TMP_DIR/kernel.fit"
"$FWTOOL" -i "$TMP_DIR/metadata.json" "$IMAGE"
grep -Fq "\"$EXPECTED_COMPATIBLE\"" "$TMP_DIR/metadata.json" || {
	printf '错误：镜像元数据不支持 %s。\n' "$EXPECTED_COMPATIBLE" >&2
	exit 1
}

"$DUMPIMAGE" -T flat_dt -p 1 -o "$TMP_DIR/device.dtb" "$TMP_DIR/kernel.fit" >/dev/null

read -r -a compatibles <<< "$("$FDTGET" -t s "$TMP_DIR/device.dtb" / compatible)"
[[ "${compatibles[0]:-}" == "$EXPECTED_COMPATIBLE" ]] || {
	printf '错误：设备树 compatible 为 %s，预期为 %s。\n' \
		"${compatibles[0]:-<空>}" "$EXPECTED_COMPATIBLE" >&2
	exit 1
}

read -r ubi_start ubi_size <<< "$("$FDTGET" -t x "$TMP_DIR/device.dtb" \
	'/soc/spi@1100a000/flash@0/partitions/partition@5c0000' reg)"

[[ "${ubi_start,,}" == "5c0000" && "${ubi_size,,}" == "${EXPECTED_UBI_SIZE,,}" ]] || {
	printf '错误：UBI reg 为 <%s %s>，预期为 <5c0000 %s>。\n' \
		"$ubi_start" "$ubi_size" "$EXPECTED_UBI_SIZE" >&2
	exit 1
}

printf '固件校验通过：BOARD=%s, compatible=%s, UBI=<0x%s 0x%s>\n' \
	"$EXPECTED_BOARD" "$EXPECTED_COMPATIBLE" "$ubi_start" "$ubi_size"
