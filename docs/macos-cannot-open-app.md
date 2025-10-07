# macOS 提示：“应用程序” 已损坏，无法打开 - 解决方法总结

本文总结了在 macOS 中遇到应用无法打开或提示已损坏时的解决方案，适用于 Catalina 及更新版本（包括 Ventura、Sonoma、Sequoia）。


## 1. 现象

常见提示包括：

- “应用程序已损坏，无法打开。您应该将它移到废纸篓。”
- “无法打开‘应用程序’，因为无法验证开发者。macOS 无法验证此 App 不包含恶意软件。”
- “应用程序将对您的电脑造成伤害。您应该将它移到废纸篓。”


## 2. 解决方法

一般情况下，只需前两个步骤即可解决问题。

### 2.1 允许“任何来源”下载的 App 运行

1. 打开 **终端** 执行：

```bash
sudo spctl --master-disable
```

2. 打开 **系统偏好设置 → 安全性与隐私 → 通用**，勾选允许来自任何来源的 App。
   - macOS Ventura 位置：**系统设置 → 隐私与安全性 → 安全性**。


### 2.2 移除应用的安全隔离属性

1. 在 **终端**执行：

```bash
sudo xattr -rd com.apple.quarantine /Applications/KimiNoBan.app
```

2. 如果不确定路径，可直接拖拽 App 到命令后面。
3. 可批量清除应用隔离属性：

```bash
sudo xattr -rc /Applications/*
```


### 2.3 macOS Ventura 额外步骤

1. 完成前两步后，打开 **系统设置 → 隐私与安全性 → 安全性**。
2. 出现提示时点击 **仍要打开**，只需一次操作。

适用于 macOS Ventura、Sonoma 和 Sequoia。


### 2.4 重新签名应用

1. 若应用因证书问题仍无法打开，可重新签名：

```bash
codesign --force --deep --sign - /Applications/name.app
```

2. 需要安装 Command Line Tools for Xcode：

```bash
xcode-select --install
```

或者手动下载 [Xcode Command Line Tools](https://developer.apple.com/download/all/)


### 2.5 覆盖恶意软件保护

1. 若仍提示应用可能对电脑造成伤害：
   - 访达 → 应用程序 → 右击软件 → **显示简介** → 勾选 **覆盖恶意软件保护**。
2. 正常应用不会出现此选项。

