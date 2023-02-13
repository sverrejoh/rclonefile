import { describe, expect, test } from "@jest/globals";
import { cloneFile, cloneFileSync } from "../index";
import { directory } from "tempy";
import { join } from "path";
import { readFileSync } from "fs";

describe("cloneFile", () => {
  test("clone file sync", () => {
    const tempDir = directory();
    const target = join(tempDir, "mario-clone.txt");
    cloneFileSync(join(__dirname, "inputs/mario.txt"), target);

    const sourceData = readFileSync(target).toString();
    const targetData = readFileSync(target).toString();

    expect(sourceData).toBe(targetData);
  });

  test("clone file async", async () => {
    const tempDir = directory();
    const target = join(tempDir, "mario-clone.txt");
    const result = await cloneFile(join(__dirname, "inputs/mario.txt"), target);

    const sourceData = readFileSync(target).toString();
    const targetData = readFileSync(target).toString();

    expect(sourceData).toBe(targetData);
  });
});
