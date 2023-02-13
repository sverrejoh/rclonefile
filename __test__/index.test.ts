import { describe, expect, test } from "@jest/globals";
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
});
