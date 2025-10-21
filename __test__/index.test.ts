/**
 * Tests for rclonefile - macOS copy-on-write file cloning
 *
 * Note: These tests require macOS with APFS filesystem support.
 * The clonefile API is macOS-specific and won't work on Linux/Windows.
 * The CI/CD pipeline runs these tests on macOS runners (Node 18, 20, 22).
 */
import { describe, expect, test } from "vitest";
import { promises as fs, existsSync } from "fs";
import { cloneFile, cloneFileSync } from "../index";
import { directory } from "tempy";
import { join } from "path";
import { readFileSync } from "fs";

describe("cloneFile", () => {
  test("clone file sync", () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    cloneFileSync(source, target);

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();

    expect(sourceData).toBe(targetData);
  });

  test("clone file async", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target);

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile async link follows and copies target", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario-link.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();

    expect(sourceData).toBe(targetData);

    expect(existsSync(target)).toBe(true);

    const stat = await fs.lstat(target);
    expect(stat.isFile()).toBe(true);
    expect(stat.isSymbolicLink()).toBe(false);
  });

  test("clonefile async ignores link when no-follow: true", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario-link.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target, { noFollow: true });

    const stat = await fs.lstat(target);

    expect(existsSync(target)).toBe(false);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  test("clonefile sync link follows and copies target", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario-link.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = cloneFileSync(source, target);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();

    expect(sourceData).toBe(targetData);

    expect(existsSync(target)).toBe(true);

    const stat = await fs.lstat(target);
    expect(stat.isFile()).toBe(true);
    expect(stat.isSymbolicLink()).toBe(false);
  });

  test("clonefile sync ignores link when no-follow: true", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario-link.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = cloneFileSync(source, target, { noFollow: true });

    const stat = await fs.lstat(target);

    expect(existsSync(target)).toBe(false);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  test("clonefile a file that doesn't exist", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/does-not-exist.txt");
    const target = join(tempDir, "mario-clone.txt");
    expect(() => cloneFileSync(source, target)).toThrow(
      "No such file or directory",
    );
  });

  test("clonefile a path that isn't a string", async () => {
    const tempDir = directory();
    const source = 42;
    const target = join(tempDir, "mario-clone.txt");
    expect(() => cloneFileSync(source, target)).toThrow(
      "Failed to convert JavaScript value `Number 42 ` into rust type `String`",
    );
  });

  test("clonefile async with noOwnerCopy option", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target, { noOwnerCopy: true });

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);

    // On macOS, the cloned file should exist with potentially different ownership
    const stat = await fs.lstat(target);
    expect(stat.isFile()).toBe(true);
  });

  test("clonefile sync with noOwnerCopy option", () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-noowner.txt");
    cloneFileSync(source, target, { noOwnerCopy: true });

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile async with cloneAcl option", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-acl.txt");
    const result = await cloneFile(source, target, { cloneAcl: true });

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);

    // On macOS with ACLs enabled, the ACLs should be cloned
    const stat = await fs.lstat(target);
    expect(stat.isFile()).toBe(true);
  });

  test("clonefile sync with cloneAcl option", () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-acl-sync.txt");
    cloneFileSync(source, target, { cloneAcl: true });

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile async with multiple options", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-multi.txt");
    const result = await cloneFile(source, target, {
      noOwnerCopy: true,
      cloneAcl: true,
    });

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile sync with multiple options", () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-multi-sync.txt");
    cloneFileSync(source, target, {
      noOwnerCopy: true,
      cloneAcl: true,
    });

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile async with all options combined", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario-link.txt");
    const target = join(tempDir, "mario-clone-all.txt");
    const result = await cloneFile(source, target, {
      noFollow: true,
      noOwnerCopy: true,
      cloneAcl: true,
    });

    const stat = await fs.lstat(target);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  test("clonefile async error - non-existent file", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/does-not-exist.txt");
    const target = join(tempDir, "mario-clone.txt");

    await expect(cloneFile(source, target)).rejects.toThrow();
  });

  test("clonefile async error - invalid target path", async () => {
    const source = join(__dirname, "inputs/mario.txt");
    const target = "/invalid/path/that/does/not/exist/file.txt";

    await expect(cloneFile(source, target)).rejects.toThrow();
  });

  test("clonefile sync error - invalid target path", () => {
    const source = join(__dirname, "inputs/mario.txt");
    const target = "/invalid/path/that/does/not/exist/file.txt";

    expect(() => cloneFileSync(source, target)).toThrow();
  });

  test("clonefile with empty options object", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-empty-opts.txt");
    const result = await cloneFile(source, target, {});

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile returns a number result", async () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-result.txt");
    const result = await cloneFile(source, target);

    expect(typeof result).toBe("number");
  });

  test("cloneFileSync returns a number result", () => {
    const tempDir = directory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone-sync-result.txt");
    const result = cloneFileSync(source, target);

    expect(typeof result).toBe("number");
  });
});
