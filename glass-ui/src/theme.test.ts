import { lightTheme, darkTheme } from "./theme";

describe("lightTheme", () => {
  it("has correct bg color", () => {
    expect(lightTheme.colors.bg).toBe("#f4f6f8");
  });

  it("has correct accent color", () => {
    expect(lightTheme.colors.accent).toBe("#5b8cff");
  });

  it("has blur value", () => {
    expect(lightTheme.blur).toBe("12px");
  });
});

describe("darkTheme", () => {
  it("has correct bg color", () => {
    expect(darkTheme.colors.bg).toBe("#0f1115");
  });

  it("has correct accent color", () => {
    expect(darkTheme.colors.accent).toBe("#7aa2ff");
  });

  it("has blur value", () => {
    expect(darkTheme.blur).toBe("12px");
  });
});
