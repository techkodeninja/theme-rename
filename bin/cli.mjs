#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import themeRename from "../index.mjs";

// ✅ Automatically detect the current directory as the theme root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeRoot = process.cwd();
const pathToConf = path.resolve(themeRoot, "themerename.json");

// ✅ Run the main replacement logic
themeRename(pathToConf);
