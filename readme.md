# Theme Rename

**Theme Rename CLI** is a command-line tool designed to simplify the process of renaming and refactoring ClassicPress themes. With a single command, it updates namespaces, package names, function prefixes, text domains, author information, and URIs throughout your theme files.

This tool is ideal for theme developers who want to quickly rebrand an existing starter theme with new identity details, ensuring consistency across PHP, JS, SCSS, and config files.

---

## Installation

Requires Node.js 18.3 or later. The tool has no third-party dependencies.

```sh
# Install globally
npm install -g theme-rename

# Or run it from a clone of this repository
git clone https://github.com/techkodeninja/theme-rename.git
cd theme-rename
npm link
```

---

## Theme Rename JSON File

To use **Theme Rename CLI**, create a `themerename.json` file in the root of your theme directory. It holds the details that will be replaced throughout your theme files.

### Example

```json
{
  "from": {
    "Name": "ExampleTheme",
    "Description": "ExampleTheme is a modern starter theme built for ClassicPress.",
    "Namespace": "ExampleTheme",
    "Uri": "https://example.com/themes/exampletheme",
    "Author": "John Doe",
    "AuthorEmail": "john.doe@example.com",
    "AuthorUri": "https://example.com",
    "Year": "2025"
  },
  "to": {
    "Name": "NewTheme",
    "Description": "NewTheme is a high-performance theme for ClassicPress.",
    "Namespace": "NewTheme",
    "Uri": "https://example.com/themes/newtheme",
    "Author": "Jane Smith",
    "AuthorEmail": "jane.smith@example.com",
    "AuthorUri": "https://example.com",
    "Year": "2026"
  },
  "ignore": [
    "assets/vendor"
  ]
}
```

`from` holds the original theme's details and `to` holds the new ones.

| Field | Required | Used for |
| --- | --- | --- |
| `Name` | Yes | `Theme Name` header. Also the source of the namespace, text domain and prefix when those aren't set. |
| `Namespace` | No | PHP namespace, `use` imports, qualified names, `@package` and composer PSR-4 keys. Defaults to `Name` in PascalCase. |
| `TextDomain` | No | Quoted text domain strings and the `Text Domain` header. Defaults to `Name` lower-cased (`New Theme` → `new-theme`, `NewTheme` → `newtheme`). |
| `Description` | No | `Description` header and any other place the old description appears. |
| `Uri` | No | Theme URI wherever it appears. |
| `Author`, `AuthorEmail`, `AuthorUri` | No | Author details wherever they appear, including copyright lines. |
| `Year` | No | Copyright year in `@copyright`, `©` and `Copyright` lines next to the author's name. |
| `ignore` | No | Paths or folders, relative to the theme root, to leave untouched. |

Every field you set in `from` must also be set in `to`. A field left out of both is simply skipped.

Place the file in the theme root:

<pre>
my-theme/
├── src/
├── style.css
├── themerename.json   <--- Place it here
├── webpack.mix.js
└── *.php
</pre>

---

## Usage

```sh
theme-rename [theme-dir] [options]
```

| Option | Description |
| --- | --- |
| `theme-dir` | Theme root directory. Defaults to the current directory. |
| `-c, --config <file>` | Path to the config file. Defaults to `<theme-dir>/themerename.json`. |
| `-n, --dry-run` | List the files that would change without writing them. |
| `-f, --force` | Run even if the theme's git working tree has uncommitted changes. |
| `-h, --help` | Show help. |
| `-v, --version` | Show the version. |

It's a good idea to preview with `--dry-run` first. Because the rename edits files in place, the tool refuses to run on a git repository with uncommitted changes, so you can always review the result with `git diff` and undo it with `git checkout .`.

### What gets renamed

Given the example config above:

| Before | After |
| --- | --- |
| `namespace ExampleTheme;` | `namespace NewTheme;` |
| `use ExampleTheme\Setup\Menus;` | `use NewTheme\Setup\Menus;` |
| `@package ExampleTheme` | `@package NewTheme` |
| `@copyright 2025 John Doe` | `@copyright 2026 Jane Smith` |
| `function exampletheme_setup()` | `function newtheme_setup()` |
| `$exampletheme_options` | `$newtheme_options` |
| `EXAMPLETHEME_VERSION` | `NEWTHEME_VERSION` |
| `__( 'Hello', "exampletheme" )` | `__( 'Hello', "newtheme" )` |
| `"ExampleTheme\\": "app/"` in composer.json | `"NewTheme\\": "app/"` |

The `style.css` header keeps its labels and spacing, and only the values change. Fields not covered by the config (such as `Version` or `Tags`) are left as they are.

```css
/*
 * Theme Name:   ExampleTheme
 * Theme URI:    https://example.com/themes/exampletheme
 * Author:       John Doe
 * Author URI:   https://example.com
 * Description:  ExampleTheme is a modern starter theme built for ClassicPress.
 * Version:      1.0.0
 * Text Domain:  exampletheme
 */
```

### Which files are processed

Files ending in `.php`, `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.tsx`, `.css`, `.scss`, `.sass`, `.json`, `.txt`, `.md`, `.xml`, `.yml`, `.yaml`, `.pot` and `.po`.

These are always skipped:

- `.git`, `node_modules` and `vendor` folders
- Minified files (`*.min.js`, `*.min.css`)
- Lock files (`package-lock.json`, `composer.lock`, `yarn.lock`, `pnpm-lock.yaml`)
- `themerename.json` itself
- Any file ending in `.ignore`
- Anything listed under `ignore` in the config

---

## Using it from code

```js
import themeRename, { loadConfig, renameTheme } from "theme-rename";

// Rename the theme that contains this config file
const changed = await themeRename( "./my-theme/themerename.json", { dryRun: true } );

// Or pass the config directly
const config = await loadConfig( "./my-theme/themerename.json" );
await renameTheme( { root: "./my-theme", config } );
```

Both return the list of changed files and throw on an invalid config.

---

## Development

```sh
npm test
```
