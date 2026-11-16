import { expect, it } from "vitest";
import { calendarSwipe } from "../src/lib/calendar-gesture";

it("moves forward on a left swipe and backward on a right swipe", () => {
  expect(calendarSwipe(-100, 4, 390)).toBe("next");
  expect(calendarSwipe(100, -4, 390)).toBe("previous");
});
it("uses a smaller travel threshold on narrow phones", () => {
  expect(calendarSwipe(-55, 0, 288)).toBe("next");
  expect(calendarSwipe(-55, 0, 1000)).toBeNull();
  expect(calendarSwipe(-80, 0, 1000)).toBe("next");
});
it("does not change weeks for taps, short drags or vertical page scrolling", () => {
  for (const [dx, dy] of [[0, 0], [10, 0], [30, 2], [10, 150], [90, 100], [-90, -100]]) {
    expect(calendarSwipe(dx, dy, 390)).toBeNull();
  }
});
it("ignores invalid gesture measurements", () => {
  expect(calendarSwipe(NaN, 0, 390)).toBeNull();
  expect(calendarSwipe(100, Infinity, 390)).toBeNull();
  expect(calendarSwipe(100, 0, 0)).toBeNull();
});
