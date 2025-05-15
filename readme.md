# Theme Rename
**Theme Rename CLI** is a command-line tool designed to simplify the process of renaming and refactoring ClassicPress themes. With a single command, it updates namespaces, package names, author information, and URIs throughout your theme files.

This tool is ideal for theme developers who want to quickly rebrand an existing starter theme with new identity details—ensuring consistency across PHP, JS, and SCSS files.

---

## Theme Rename JSON File
To use **Theme Rename CLI**, you need to create a `themerename.json` file in the root of your theme directory. This file contains the information that will be replaced throughout your theme files.

---

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
    "Year: "2025"
  },
  "to": {
    "Name": "NewTheme",
    "Description": "NewTheme is a high-performance theme for ClassicPress.",
    "Namespace": "NewTheme",
    "Uri": "https://example.com/themes/newtheme",
    "Author": "Jane Smith",
    "AuthorEmail": "jane.smith@example.com",
    "AuthorUri": "https://example.com",
    "Year: "2025"
  }
}


```
## Explanation
from: Represents the original theme's information.

to: Represents the new theme's information after the rename.

<pre>
my-theme/
├── bin/
├── src/
├── style.css
├── themerename.json   <--- Place it here
├── webpack.mix.js
└── *.php
</pre>
## Usage
<pre>
theme-renname
</pre>

This will update PHP DocBlock and style.css header.
```
/**
 * @package   ExampleTheme
 * @author    John Doe <john.doe@example.com>
 * @license   https://www.gnu.org/licenses/gpl-2.0.html
 * @link      https://example.com/themes/exampletheme
 */

 ```
 ```
/*
 * Theme Name:   ExampleTheme
 * Theme URI:    https://example.com/themes/exampletheme
 * Author:       John Doe
 * Author URI:   https://example.com
 * Description:  ExampleTheme is a modern starter theme built for ClassicPress.
 * License:      GNU General Public License v2.0 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Tags:         grid-layout, one-column, two-columns, custom-background, custom-colors, custom-header, custom-logo, custom-menu, featured-images, footer-widgets, post-formats, sticky-post, theme-options, threaded-comments, translation-ready, blog
 * Requires CP:  2.0
 * Requires PHP: 7.4
 * Version:      1.0.0
 * Text Domain:  exampletheme
 */

 ```