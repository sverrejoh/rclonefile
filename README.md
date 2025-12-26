# rclonefile

> The macOS API for creating copy on write clones of files.

## Description

This is a small wrapper around the
[clonefile](https://www.manpagez.com/man/2/clonefile/) API on macOS for cloning
files using the APFS file system.

## Usage

### async/await

```js

import { cloneFile } from "rclonefile";

await cloneFile("source/mario.txt", "target/mario-clone-txt");

```

### Promise

```js

import { cloneFile } from "rclonefile";

cloneFile("source/mario.txt", "target/mario-clone-txt").then(() => {
	// Success
})

```

### Sync API

```js

import { cloneFileSync } from "rclonefile";

cloneFileSync("source/mario.txt", "target/mario-clone-txt");

```

## Options

All functions accept an optional third argument with the following options:

```ts
interface CloneFileOptions {
  noFollow?: boolean;    // Don't follow symlinks, clone the link itself
  noOwnerCopy?: boolean; // Don't copy ownership information
  cloneAcl?: boolean;    // Clone ACL (Access Control List) information
}
```

### Example with options

```js
import { cloneFile } from "rclonefile";

// Clone a symlink as a symlink (don't follow it)
await cloneFile("source/link.txt", "target/link.txt", { noFollow: true });

// Clone without copying ownership
await cloneFile("source/file.txt", "target/file.txt", { noOwnerCopy: true });
```

## Links

- [rclonefile-cli](https://github.com/sverrejoh/rclonefile-cli) - CLI for this module
- [clonefile(2)](https://www.manpagez.com/man/2/clonefile/) - Man page for system API

