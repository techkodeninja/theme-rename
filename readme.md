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
    "Name": "Backdrop",
    "Description": "Backdrop is a next-generation starter theme designed to help theme authors write elegant, intelligent, and modern code.",
    "Namespace": "Backdrop",
    "Uri": "https://example.com/themes/backdrop",
    "Author": "Benjamin Lu",
    "AuthorEmail": "benlumia007@gmail.com",
    "AuthorUri": "https://example.com"
  },
  "to": {
    "Name": "Superman",
    "Description": "A supercharged theme built for performance.",
    "Namespace": "Superman",
    "Uri": "https://example.com/themes/superman",
    "Author": "Benjamin Lu",
    "AuthorEmail": "benlumia007@gmail.com",
    "AuthorUri": "https://example.com"
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
 * @package   Backdrop
 * @author    Benjamin Lu <benlumia007@gmail.com>
 * @copyright 2024 Benjamin Lu
 * @license   https://www.gnu.org/licenses/gpl-2.0.html
 * @link      https://luthemes.com/portfolio/backdrop
 ```
 ```
/*!
 * Theme Name:   Backdrop
 * Theme URI:    https://luthemes.com/portfolio/backdrop
 * Author:       Benjamin Lu
 * Author URI:   https://luthemes.com
 * Description:  Backdrop is a next-generation starter theme designed to help theme authors write elegant, intelligent, and modern code. It is structured to provide clean, maintainable, and scalable foundations for building high-quality ClassicPress themes.
 * License:      GNU General Public License v2.0 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Tags:         grid-layout, one-column, two-columns, custom-background, custom-colors, custom-header, custom-logo, custom-menu, featured-images, footer-widgets, post-formats, sticky-post, theme-options, threaded-comments, translation-ready, blog
 * Requires CP:  2.0
 * Requires PHP: 7.4
 * Version:      0.0.8
 * Text Domain:  backdrop
 */
 ```