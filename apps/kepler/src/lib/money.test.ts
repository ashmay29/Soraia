import { describe, expect, it } from "vitest";
import { rupeesToPaise } from "./money";

const paise = (s: string) => {
  const r = rupeesToPaise(s);
  if ("error" in r) throw new Error(`unexpected error: ${r.error}`);
  return r.paise;
};
const err = (s: string) => {
  const r = rupeesToPaise(s);
  return "error" in r ? r.error : null;
};

describe("rupeesToPaise", () => {
  it("handles whole rupees", () => {
    expect(paise("2500")).toBe(250000);
    expect(paise("1")).toBe(100);
    expect(paise("50000")).toBe(5000000);
  });

  it("handles one and two decimal places", () => {
    expect(paise("2500.5")).toBe(250050);
    expect(paise("2500.50")).toBe(250050);
    expect(paise("0.01")).toBe(1);
    expect(paise("0.10")).toBe(10);
  });

  it("avoids binary float drift", () => {
    // parseFloat("19.99") * 100 === 1998.9999999999998
    expect(paise("19.99")).toBe(1999);
    expect(paise("0.29")).toBe(29);
    expect(paise("8.87")).toBe(887);
  });

  it("strips rupee symbols, commas and spaces", () => {
    expect(paise(" ₹ 1,20,000.50 ")).toBe(12000050);
    expect(paise("1,000")).toBe(100000);
  });

  it("rejects malformed input", () => {
    expect(err("")).toBeTruthy();
    expect(err("abc")).toBeTruthy();
    expect(err("12.345")).toBeTruthy(); // more than 2 decimals
    expect(err("-100")).toBeTruthy();
    expect(err("1.2.3")).toBeTruthy();
    expect(err("1e5")).toBeTruthy();
  });

  it("rejects zero and amounts beyond ICICI's 9-digit limit", () => {
    expect(err("0")).toBeTruthy();
    expect(err("0.00")).toBeTruthy();
    expect(err("1000000000")).toBeTruthy();
    expect(paise("999999999")).toBe(99999999900);
  });
});
