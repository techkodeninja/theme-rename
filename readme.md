# Theme Rename
Theme Rename CLI is a command-line tool designed to simplify the process of renaming and refactoring ClassicPress themes. With a single command, it updates namespaces, package names, author information, and URIs throughout your theme files.

This tool is ideal for theme developers who want to quickly rebrand an existing starter theme with new identity details—ensuring consistency across PHP, JS, SCSS files.

## Theme Rename JSON File
To use **Theme Rename CLI**, you need to create a `themerename.json` file in the root of your theme directory. This file contains the information that will be replaced throughout your theme files.

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
    "AuthorUri": "https://example.com",
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
<pre>
run theme-renname