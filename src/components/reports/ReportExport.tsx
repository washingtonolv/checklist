"use client";

import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportRow {
  store: string;
  code: string;
  task: string;
  category: string;
  recurrence: string;
  due: string;
  status: string;
  executor: string;
  completedAt: string;
  photos: number;
}

export interface ReportSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  rate: number;
}

function stamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function ReportExport({
  rows,
  summary,
  periodLabel,
  filterLabel
}: {
  rows: ReportRow[];
  summary: ReportSummary;
  periodLabel: string;
  filterLabel: string;
}) {
  function exportExcel() {
    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(rows);
    dataSheet["!cols"] = [
      { wch: 24 },
      { wch: 12 },
      { wch: 42 },
      { wch: 30 },
      { wch: 14 },
      { wch: 20 },
      { wch: 22 },
      { wch: 24 },
      { wch: 20 },
      { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Atividades");

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["CHECKLIST OPERACIONAL D&D"],
      ["Relatório operacional"],
      [],
      ["Período", periodLabel],
      ["Filtros", filterLabel],
      [],
      ["Indicador", "Valor"],
      ["Atividades previstas", summary.total],
      ["Concluídas", summary.completed],
      ["Em aberto", summary.pending],
      ["Atrasadas", summary.overdue],
      ["Taxa de execução", `${summary.rate}%`],
      [],
      ["Gerado em", new Date().toLocaleString("pt-BR")]
    ]);
    summarySheet["!cols"] = [{ wch: 28 }, { wch: 48 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    XLSX.writeFile(workbook, `checklist-dd-relatorio-${stamp()}.xlsx`);
  }

  function exportPdf() {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFillColor(137, 23, 69);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 54, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CHECKLIST OPERACIONAL D&D", 32, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relatório operacional das lojas", 32, 40);

    doc.setTextColor(137, 23, 69);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Período: ${periodLabel}`, 32, 76);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Filtros: ${filterLabel}`, 32, 92);
    doc.text(
      `Previstas: ${summary.total}  ·  Concluídas: ${summary.completed}  ·  Em aberto: ${summary.pending}  ·  Atrasadas: ${summary.overdue}  ·  Execução: ${summary.rate}%`,
      32,
      106
    );

    autoTable(doc, {
      startY: 122,
      head: [["Loja", "Código", "Atividade", "Categoria", "Prazo", "Status", "Executor", "Fotos"]],
      body: rows.map((row) => [
        row.store,
        row.code,
        row.task,
        row.category,
        row.due,
        row.status,
        row.executor,
        String(row.photos)
      ]),
      styles: { fontSize: 7.5, cellPadding: 4, textColor: [137, 23, 69] },
      headStyles: { fillColor: [137, 23, 69], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241, 253, 255] },
      margin: { left: 32, right: 32 },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setTextColor(137, 23, 69);
        doc.text(
          `Gerado em ${new Date().toLocaleString("pt-BR")} · Checklist Operacional D&D`,
          32,
          pageHeight - 18
        );
      }
    });

    doc.save(`checklist-dd-relatorio-${stamp()}.pdf`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={exportExcel} className="btn-secondary btn-sm" disabled={!rows.length}>
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </button>
      <button type="button" onClick={exportPdf} className="btn-primary btn-sm" disabled={!rows.length}>
        <FileDown className="h-4 w-4" />
        PDF
      </button>
      <button type="button" onClick={() => window.print()} className="btn-ghost btn-sm no-print">
        <Printer className="h-4 w-4" />
        Imprimir
      </button>
    </div>
  );
}

