# SPDX-License-Identifier: Apache-2.0

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for the official AdGuard Home package
LUCI_DESCRIPTION:=Manage the official AdGuard Home service and open its web interface.
LUCI_DEPENDS:=+luci-base +adguardhome
LUCI_PKGARCH:=all

PKG_MAINTAINER:=noxsk
PKG_LICENSE:=Apache-2.0

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
