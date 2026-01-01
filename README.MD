# Dotenv Action

用于读取 `.env` 文件。支持多文件读取、正则表达式过滤、自动导出至环境变量以及敏感信息掩码。

## 🌟 功能特性

- **多文件支持**：支持同时读取多个 `.env` 文件。
- **正则过滤**：通过正则表达式仅加载符合特定规则的键（Key）。
- **环境导出**：可选将变量自动导出到 `$GITHUB_ENV`，供后续步骤直接使用。
- **安全掩码**：支持将读取到的值在 GitHub Actions 日志中设为机密（Masking），防止密钥泄露。
- **组合输出**：提供一个包含所有键值的 `combined` 输出参数。

## 🚀 快速使用

### 基础用法
默认读取根目录下的 `.env` 文件：

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v6

  - name: Load .env
    uses: lipangeng/dotenv-action@v1
    
  - name: Use Output
    run: echo "The version is ${{ steps.dotenv.outputs.VERSION }}"
```

### 使用正则表达式过滤
仅加载以 `APP_` 开头的变量：

```yaml
- name: Filtered Load
  uses: lipangeng/dotenv-action@v1
  with:
    filter: '^APP_'
```

## ⚙️ 输入参数 (Inputs)

| 参数 | 描述                          | 默认值 |
| :--- |:----------------------------| :--- |
| `files` | `.env` 文件的路径。支持多行输入以指定多个文件。 | `.env` |
| `filter` | 用于筛选键（Key）的正则表达式模式。         | `.*` (匹配所有) |
| `export` | 是否将读取到的变量导出到全局环境变量。         | `false` |
| `mask` | 是否在日志中对读取到的值进行掩码处理，以保护机密。   | `false` |

## 📤 输出参数 (Outputs)

| 参数 | 描述 |
| :--- | :--- |
| `combined` | 包含所有读取到的变量，格式为多行的 `KEY=VALUE`。 |
| `[KEY]` | 每一个读取到的键都会作为一个独立的输出，可以通过 `${{ steps.<id>.outputs.KEY }}` 访问。 |

## 🛠 开发与构建

该项目使用 Node.js 20 运行。

```bash
# 安装依赖
npm install

# 构建项目
npm run build
```