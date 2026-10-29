import { describe, expect, it } from "vitest";
import { displayNameSchema, emailSchema, signUpSchema } from "@/lib/account-validation";

describe("Sign-up safeguards", () => {
  it("rejects clearly random or repeated letters", () => {
    for (const name of ["asdf", "qwerty", "zzzzzz", "bcdfghjk", "123456"]) expect(displayNameSchema.safeParse(name).success).toBe(false);
  });
  it("allows readable local and international names", () => {
    for (const name of ["Jr Escosura", "José", "Ana-Marie", "O’Neil", "Ng", "李明"]) expect(displayNameSchema.safeParse(name).success).toBe(true);
  });
  it("rejects invalid emails", () => {
    for (const email of ["randomletters", "hello@", "a b@example.com"]) expect(emailSchema.safeParse(email).success).toBe(false);
  });
  it("permits random passwords for security", () => {
    expect(signUpSchema.safeParse({ display_name: "Jr Escosura", email: "jr@example.com", password: "qwerty!K83", confirm_password: "qwerty!K83" }).success).toBe(true);
  });
  it("rejects mismatched password confirmation", () => {
    expect(signUpSchema.safeParse({ display_name: "Ana", email: "ana@example.com", password: "Safe!2345", confirm_password: "Different!" }).success).toBe(false);
  });
});