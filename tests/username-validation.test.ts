import {describe,it,expect} from "vitest";
import {usernameSchema} from "../src/lib/validation";
describe("username validation",()=>{
 it("normalizes whitespace and case for unique login lookup",()=>{expect(usernameSchema.parse("  Maria.Silva  ")).toBe("maria.silva");});
 it.each(["ma","maria silva","mária","user@example.com","x".repeat(41)])("rejects invalid username %s",value=>{expect(usernameSchema.safeParse(value).success).toBe(false);});
});
