import { describe, expect, test } from "vitest";
import { promises as fs, existsSync } from "fs";
import { cloneFile, cloneFileSync } from "../index";
import { temporaryDirectory } from "tempy";
import { join } from "path";
import { readFileSync } from "fs";

describe("cloneFile", () => {
  test("clone file sync", () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    cloneFileSync(source, target);

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();

    expect(sourceData).toBe(targetData);
  });

  test("clone file async", async () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target);

    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile async link follows and copies target", async () => {
    const tempDir = temporaryDirectory();
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
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario-link.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target, { noFollow: true });

    const stat = await fs.lstat(target);

    expect(existsSync(target)).toBe(false);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  test("clonefile sync link follows and copies target", async () => {
    const tempDir = temporaryDirectory();
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
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario-link.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = cloneFileSync(source, target, { noFollow: true });

    const stat = await fs.lstat(target);

    expect(existsSync(target)).toBe(false);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  test("clonefile a file that doesn't exist", async () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/does-not-exist.txt");
    const target = join(tempDir, "mario-clone.txt");
    expect(() => cloneFileSync(source, target)).toThrow(
      "No such file or directory",
    );
  });

  test("clonefile a path that isn't a string", async () => {
    const tempDir = temporaryDirectory();
    const source = 42;
    const target = join(tempDir, "mario-clone.txt");
    expect(() => cloneFileSync(source, target)).toThrow(
      "Failed to convert JavaScript value `Number 42 ` into rust type `String`",
    );
  });

  test("clonefile with noOwnerCopy option", async () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target, { noOwnerCopy: true });

    expect(result).toBe(0);
    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile with cloneAcl option", async () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target, { cloneAcl: true });

    expect(result).toBe(0);
    expect(existsSync(target)).toBe(true);

    const sourceData = readFileSync(source).toString();
    const targetData = readFileSync(target).toString();
    expect(sourceData).toBe(targetData);
  });

  test("clonefile with all options combined", async () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(source, target, {
      noFollow: false,
      noOwnerCopy: true,
      cloneAcl: true,
    });

    expect(result).toBe(0);
    expect(existsSync(target)).toBe(true);
  });

  test("clonefile async throws on non-existent file", async () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/does-not-exist.txt");
    const target = join(tempDir, "mario-clone.txt");

    await expect(cloneFile(source, target)).rejects.toThrow(
      "No such file or directory",
    );
  });

  test("clonefile fails when destination already exists", async () => {
    const tempDir = temporaryDirectory();
    const source = join(__dirname, "inputs/mario.txt");
    const target = join(tempDir, "mario-clone.txt");

    // First clone should succeed
    await cloneFile(source, target);
    expect(existsSync(target)).toBe(true);

    // Second clone to same destination should fail
    await expect(cloneFile(source, target)).rejects.toThrow("File exists");
  });
});
