import { describe, expect, it } from "vitest";
import { parseIciciDate } from "./payments";
import { isSuccessCode } from "./icici/client";

describe("isSuccessCode", () => {
  it("accepts both documented success codes", () => {
    // The spec uses "000" in some responses and "0000" in others.
    expect(isSuccessCode("000")).toBe(true);
    expect(isSuccessCode("0000")).toBe(true);
  });

  it("rejects everything else, including R1000", () => {
    // R1000 means "request initiated", NOT "payment succeeded" — treating it as
    // success would mark unpaid links as paid.
    expect(isSuccessCode("R1000")).toBe(false);
    expect(isSuccessCode("0001")).toBe(false);
    expect(isSuccessCode("")).toBe(false);
    expect(isSuccessCode(undefined)).toBe(false);
    expect(isSuccessCode(0)).toBe(false);
    expect(isSuccessCode(null)).toBe(false);
  });
});

describe("parseIciciDate", () => {
  it("reads YYYYMMDDHHMISS as IST", () => {
    // 20260720194006 IST === 14:10:06 UTC
    expect(parseIciciDate("20260720194006")?.toISOString()).toBe("2026-07-20T14:10:06.000Z");
  });

  it("handles midnight IST rolling back a day in UTC", () => {
    expect(parseIciciDate("20260721003000")?.toISOString()).toBe("2026-07-20T19:00:00.000Z");
  });

  it("returns undefined for malformed input rather than an Invalid Date", () => {
    expect(parseIciciDate("")).toBeUndefined();
    expect(parseIciciDate("2026-07-20")).toBeUndefined();
    expect(parseIciciDate("202607201940")).toBeUndefined();
    expect(parseIciciDate("not a date")).toBeUndefined();
  });
});
