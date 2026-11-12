import { expect, it, vi } from "vitest";
import * as React from "react";

const state = vi.hoisted(() => ({
  excelLoaded: false,
  pdfLoaded: false,
  writeFile: vi.fn(),
  savePdf: vi.fn(),
  setExporting: vi.fn(),
  showError: vi.fn(),
  documents: [] as any[]
}));
vi.mock("react", async original => ({ ...await original<typeof React>(), useState: () => [null, state.setExporting] }));
vi.mock("sonner", () => ({ toast: { error: state.showError } }));
vi.mock("xlsx", async original => { state.excelLoaded = true; return { ...await original<any>(), writeFile: state.writeFile }; });
vi.mock("jspdf", async original => {
  state.pdfLoaded = true;
  const real = await original<any>();
  return { ...real, jsPDF: function(options: unknown) {
    const doc = new real.jsPDF(options);
    doc.save = state.savePdf;
    state.documents.push(doc);
    return doc;
  } };
});
// Vitest's JSX transform and Next's runtime both use the same element shape.
vi.stubGlobal("React", React);

const props = {
  rows: [{ store: "Fixture Store", code: "FIX", task: "Fixture Task", category: "Routine", recurrence: "daily", due: "12/11/2026", status: "Concluída", executor: "Fixture", completedAt: "12/11/2026", photos: 2 }],
  summary: { total: 1, completed: 1, pending: 0, overdue: 0, rate: 100 },
  periodLabel: "Novembro de 2026",
  filterLabel: "Todas as lojas"
};

it("loads export libraries only after a click and preserves Excel/PDF content", async () => {
  const { ReportExport } = await import("../src/components/reports/ReportExport");
  const element = ReportExport(props) as React.ReactElement<any>;
  expect(state.excelLoaded).toBe(false);
  expect(state.pdfLoaded).toBe(false);
  const buttons = element.props.children;
  buttons[0].props.onClick();
  await vi.waitFor(() => expect(state.writeFile).toHaveBeenCalledOnce());
  const XLSX = await import("xlsx");
  const [workbook, filename] = state.writeFile.mock.calls[0];
  expect(filename).toMatch(/\.xlsx$/);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets.Atividades)).toEqual(props.rows);
  expect(state.pdfLoaded).toBe(false);
  buttons[1].props.onClick();
  await vi.waitFor(() => expect(state.savePdf).toHaveBeenCalledOnce());
  expect(state.savePdf.mock.calls[0][0]).toMatch(/\.pdf$/);
  const pdf = state.documents[0].output();
  expect(pdf).toMatch(/^%PDF/);
  expect(pdf).toContain("Fixture Task");
  expect(state.showError).not.toHaveBeenCalled();
  expect(state.setExporting).toHaveBeenLastCalledWith(null);
});

it("reports an export failure and releases the loading state for retry", async () => {
  const { ReportExport } = await import("../src/components/reports/ReportExport");
  state.writeFile.mockImplementationOnce(() => { throw new Error("Fixture export failure"); });
  const element = ReportExport(props) as React.ReactElement<any>;
  element.props.children[0].props.onClick();
  await vi.waitFor(() => expect(state.showError).toHaveBeenCalledOnce());
  expect(state.setExporting).toHaveBeenLastCalledWith(null);
});
