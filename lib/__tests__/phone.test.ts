import { parse, formatForDisplay, validate, toE164, DEFAULT_REGION } from "../phone";

describe("lib/phone", () => {
  describe("parse", () => {
    it("returns null for empty input", () => {
      expect(parse("")).toBeNull();
      expect(parse("   ")).toBeNull();
    });

    it("parses valid US number with default region", () => {
      const p = parse("202-456-1414", "US");
      expect(p).not.toBeNull();
    });

    it("parses valid international number", () => {
      const p = parse("+212612345678", "US");
      expect(p).not.toBeNull();
    });

    it("returns null for invalid input", () => {
      expect(parse("abc")).toBeNull();
    });
  });

  describe("formatForDisplay", () => {
    it("returns formatted international string for valid number", () => {
      const formatted = formatForDisplay("2024561414", "US");
      expect(formatted).toMatch(/\+1/);
      expect(formatted).toContain("202");
    });

    it("returns original input when parse fails", () => {
      expect(formatForDisplay("xyz")).toBe("xyz");
    });
  });

  describe("validate", () => {
    it("returns true for valid number", () => {
      expect(validate("202-456-1414", "US")).toBe(true);
      expect(validate("+212612345678")).toBe(true);
    });

    it("returns false for invalid or empty", () => {
      expect(validate("")).toBe(false);
      expect(validate("12")).toBe(false);
      expect(validate("abc")).toBe(false);
    });
  });

  describe("toE164", () => {
    it("returns E.164 string for valid number", () => {
      const e164 = toE164("202-456-1414", "US");
      expect(e164).toBe("+12024561414");
    });

    it("returns E.164 for Morocco number with default region", () => {
      const e164 = toE164("0612345678", DEFAULT_REGION);
      expect(e164).toMatch(/^\+212/);
    });

    it("returns null for invalid input", () => {
      expect(toE164("")).toBeNull();
      expect(toE164("abc")).toBeNull();
      expect(toE164("12")).toBeNull();
    });
  });
});
