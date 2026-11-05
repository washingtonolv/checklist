"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Camera, CalendarClock, Save } from "lucide-react";
import { saveTemplateAction } from "@/actions/templates";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import { PHOTO_LABELS, RECURRENCE_LABELS } from "@/lib/constants";
import type { Category, Recurrence, Store, TaskTemplate } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Criar modelo"}
    </button>
  );
}

export function TemplateForm({
  template,
  categories,
  stores
}: {
  template?: TaskTemplate;
  categories: Category[];
  stores: Store[];
}) {
  const [state, action] = useFormState(saveTemplateAction, initialActionState);
  const [recurrence, setRecurrence] = useState<Recurrence>(template?.recurrence ?? "daily");
  const editing = Boolean(template);

  return (
    <form action={action} className="space-y-5">
      {template ? <input type="hidden" name="id" value={template.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div>
        <label htmlFor="title" className="label">Nome da atividade *</label>
        <input id="title" name="title" required defaultValue={template?.title} className="input" placeholder="Ex.: Organização geral do estoque" />
      </div>

      <div>
        <label htmlFor="description" className="label">Descrição / orientação</label>
        <textarea id="description" name="description" rows={3} defaultValue={template?.description} className="input" placeholder="Explique o que deve ser feito e o padrão esperado." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className="label">Categoria *</label>
          <select id="categoryId" name="categoryId" required defaultValue={template?.categoryId ?? ""} className="input">
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recurrence" className="label">Periodicidade *</label>
          <select
            id="recurrence"
            name="recurrence"
            className="input"
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value as Recurrence)}
          >
            {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((key) => (
              <option key={key} value={key}>{RECURRENCE_LABELS[key]}</option>
            ))}
          </select>
          <p className="hint">A geração evita duplicidade por loja e período.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="dueTime" className="label">Horário limite *</label>
          <input id="dueTime" name="dueTime" type="time" required defaultValue={template?.dueTime ?? "18:00"} className="input" />
        </div>
        {recurrence === "once" ? (
          <div>
            <label htmlFor="onceDueDate" className="label">Data da atividade *</label>
            <input
              id="onceDueDate"
              name="onceDueDate"
              type="date"
              required
              defaultValue={template?.onceDueDate ?? ""}
              className="input"
            />
          </div>
        ) : (
          <input type="hidden" name="onceDueDate" value="" />
        )}
        <div>
          <label htmlFor="photoRequirement" className="label">Evidência fotográfica *</label>
          <select id="photoRequirement" name="photoRequirement" defaultValue={template?.photoRequirement ?? "optional"} className="input">
            {(Object.keys(PHOTO_LABELS) as Array<keyof typeof PHOTO_LABELS>).map((key) => (
              <option key={key} value={key}>{PHOTO_LABELS[key]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-pink/10 bg-turquesa/5 p-3 text-xs text-pink/60">
        <p className="flex items-center gap-2 font-semibold text-pink">
          <Camera className="h-4 w-4" />
          Regra de evidência
        </p>
        <p className="mt-1">
          Quando a foto é obrigatória, a atividade não pode ser concluída sem pelo menos uma imagem anexada. A regra é
          validada no servidor e no banco de dados.
        </p>
      </div>

      <div>
        <p className="label">Lojas em que a rotina será gerada *</p>
        {stores.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {stores.map((store) => (
              <label key={store.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink/15 bg-white px-3.5 py-2.5 hover:border-turquesa">
                <input
                  type="checkbox"
                  name="storeIds"
                  value={store.id}
                  defaultChecked={template ? template.storeIds.includes(store.id) : store.active}
                  className="h-4 w-4 accent-[#891745]"
                />
                <span className="text-sm text-pink/75">{store.name}</span>
                {!store.active ? <span className="badge border border-pink/15 text-pink/45">Inativa</span> : null}
              </label>
            ))}
          </div>
        ) : (
          <Alert tone="info">Cadastre lojas antes de criar modelos de tarefas.</Alert>
        )}
        <p className="hint">Lojas inativas não recebem novas atividades, mesmo que estejam marcadas.</p>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink/15 bg-white px-3.5 py-2.5">
        <input type="checkbox" name="active" defaultChecked={template?.active ?? true} className="h-4 w-4 accent-[#891745]" />
        <span className="flex items-center gap-2 text-sm font-semibold text-pink/75">
          <CalendarClock className="h-4 w-4 text-pink/45" />
          Modelo ativo
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-pink/10 pt-4">
        <Link href="/modelos" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </form>
  );
}

