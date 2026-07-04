# SPDX-License-Identifier: Apache-2.0
#
# Copyright (C) 2026

include $(TOPDIR)/rules.mk

PKG_VERSION:=0.0.2
PKG_RELEASE:=1

LUCI_TITLE:=Fresh Theme
LUCI_DEPENDS:=+luci-base +luci-theme-bootstrap
LUCI_PKGARCH:=all

PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=ImmortalWrt contributors

define Package/luci-theme-fresh/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.Fresh
	uci commit luci
}
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
