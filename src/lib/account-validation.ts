import { z } from "zod";

// Conservative heuristics catch obvious keyboard mashing, not every unfamiliar name.
export function isReadableName(value: string) {
  const name = value.normalize("NFC").trim();
  if (!/^[\p{L}\p{M} .’'\-]+$/u.test(name)) return false;
  const letters = name.replace(/[^\p{L}]/gu, "").toLowerCase();
  if (letters.length < 2 || /(.)\1{3}/u.test(letters)) return false;
  if (/^(?:asdf|qwer|zxcv|qwerty|test|random|fake|abcdef|hjkl|foobar|xyz)+$/i.test(letters)) return false;
  if (/^[a-z]+$/.test(letters) && letters.length >= 5 && !/[aeiouy]/.test(letters)) return false;
  return true;
}

export const displayNameSchema = z.string().trim().min(2, "Enter your display name (at least 2 letters).")
  .max(80, "Use no more than 80 characters.")
  .refine(isReadableName, "Please enter a readable name, not random letters or repeated characters.");
export const emailSchema = z.string().trim().max(254).email("Enter a valid email address.");
export const signUpSchema = z.object({
  display_name: displayNameSchema,
  email: emailSchema,
  password: z.string().min(8, "Use at least 8 characters.").max(128),
  confirm_password: z.string(),
}).refine((value) => value.password === value.confirm_password, {
  message: "Passwords don't match.", path: ["confirm_password"],
});
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.").max(128) });