import { describe, expect, it } from "vitest";
import { serviceSchema } from "@/lib/services";

const offer = { title: "Electrical repairs", category: "Electrician", municipality: "General Luna", barangay: "Catangnan", description: "I can help with electrical repairs.", provider_name: "Jr Escosura", contact: "09171234567" };
describe("Local service offers", () => {
  it("accepts someone offering electrician services", () => {
    expect(serviceSchema.safeParse(offer).success).toBe(true);
  });
  it("accepts someone offering gymnastics coaching", () => {
    expect(serviceSchema.safeParse({ ...offer, title: "Gymnastics lessons", category: "Gymnastics Coach" }).success).toBe(true);
  });
  it("applies readable-name safeguards to service providers", () => {
    expect(serviceSchema.safeParse({ ...offer, provider_name: "qwerty" }).success).toBe(false);
  });
});