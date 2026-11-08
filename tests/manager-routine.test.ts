import { describe, it, expect } from "vitest";
import { routinePriority, storeToday, validRoutineDate } from "../src/lib/manager-routine";
import type { Task } from "../src/lib/types";
const now = new Date("2026-11-08T15:00:00Z");
function task(id:string, status:Task["status"], dueDate="2026-11-08", dueTime="18:00"):Task { return { id, status, dueDate, dueTime } as Task; }
describe("manager routine",()=> {
 it("prioritizes corrections over older overdue tasks and ignores completed work",()=> {
  const result = routinePriority([task("done","completed"),task("old","pending","2026-11-01"),task("fix","correction_requested")],"2026-11-08","2026-11-08",now);
  expect(result.next?.id).toBe("fix"); expect(result.remaining).toBe(2);
 });
 it("prioritizes missed deadlines over tasks due later",()=> {
  expect(routinePriority([task("later","pending"),task("late","pending","2026-11-08","09:00")],"2026-11-08","2026-11-08",now).next?.id).toBe("late");
 });
 it("keeps another selected day separate from today's backlog",()=> {
  const result=routinePriority([task("old","pending","2026-11-01"),task("future","pending","2026-11-09")],"2026-11-09","2026-11-08",now);
  expect(result.next?.id).toBe("future"); expect(result.remaining).toBe(1);
 });
 it("handles dates with no remaining tasks",()=>expect(routinePriority([task("done","completed")],"2026-11-08","2026-11-08",now).next).toBeUndefined());
 it("uses the store timezone instead of UTC after midnight",()=>expect(storeToday(new Date("2026-11-09T01:00:00Z"))).toBe("2026-11-08"));
 it("rejects invalid dates from the URL",()=> {expect(validRoutineDate("2026-02-31","2026-11-08")).toBe("2026-11-08");expect(validRoutineDate("bad","2026-11-08")).toBe("2026-11-08");});
});
