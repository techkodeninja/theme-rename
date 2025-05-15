#!/usr/bin/env node
import path         from "path";
import { fileURLToPath } from "url";
import themeRename  from "../index.mjs";

const __dirname   = path.dirname( fileURLToPath( import.meta.url ) );
const themeRoot   = process.argv[2] ? path.resolve( process.argv[2] ) : process.cwd();
const pathToConf  = path.resolve( themeRoot, "themerename.json" );

// ✅ Run the main replacement logic
themeRename( pathToConf );
