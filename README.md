# rclonefile

The macOS API for creating copy on write clones of files.

This is a small wrapper around the
[clonefile](https://www.manpagez.com/man/2/clonefile/) API on macOS for cloning
files using the APFS file system.

# Usage

## Sync API

```js

import { cloneFileSync } from "rclonefile";

cloneFileSync("source/mario.txt", "target/mario-clone-txt");

```

## Sync API

```js

import { cloneFile } from "rclonefile";

await cloneFile("source/mario.txt", "target/mario-clone-txt");

```

## Sync API using Promise

```js

import { cloneFile } from "rclonefile";

cloneFile("source/mario.txt", "target/mario-clone-txt").then(() => {
	// Success
})

```
