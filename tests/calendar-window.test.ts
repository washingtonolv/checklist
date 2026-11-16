import { expect, it } from "vitest";
import { calendarWindow, mergeCalendarDays } from "../src/lib/calendar-window";
const days = (date: string) => calendarWindow(date).map(date => ({ date, count: 0, complete: false }));

it("keeps the selected date at the center across month and year boundaries", () => {
  expect(calendarWindow("2026-12-02", 3)).toEqual(["2026-11-29", "2026-11-30", "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05"]);
  expect(calendarWindow("2027-01-01", 1)).toEqual(["2026-12-31", "2027-01-01", "2027-01-02"]);
  expect(calendarWindow("2028-03-01", 1)[0]).toBe("2028-02-29");
});
it("retains neighbors and refreshes activity counts without duplicate days", () => {
  const next = days("2026-12-03"); next[10] = { date: "2026-12-03", count: 3, complete: true };
  const merged = mergeCalendarDays(days("2026-12-02"), next, "2026-12-03");
  expect(merged[0].date).toBe("2026-11-22");
  expect(merged.at(-1)?.date).toBe("2026-12-13");
  expect(merged.filter(day => day.date === "2026-12-03")).toEqual([{ date: "2026-12-03", count: 3, complete: true }]);
});
it("replaces distant buffers instead of presenting a gap as consecutive days", () => {
  const next = days("2027-03-01");
  expect(mergeCalendarDays(days("2026-12-02"), next, "2027-03-01")).toEqual(next);
});
it("bounds the in-memory calendar after browsing many dates", () => {
  let buffer = days("2026-12-01");
  for (const date of calendarWindow("2027-02-01", 60)) buffer = mergeCalendarDays(buffer, days(date), date);
  expect(buffer.length).toBeLessThanOrEqual(91);
});
