// Read version and name from package.json at build time
import pkg from "../package.json" with { type: "json" };

export const VERSION = pkg.version;
export const NAME = pkg.name;
