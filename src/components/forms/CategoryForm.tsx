"use client";

import Link from "next/link";
import { FormExperience } from "./FormExperience";
import { useFormState, useFormStatus } from "react-dom";
import { FolderTree, Save } from "@/components/ui/material-icons";
import { saveCategoryAction } from "@/actions/categories";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import type { Category } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending} aria-busy={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Criar categoria"}
    </button>
  );
}

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action] = useFormState(saveCategoryAction, initialActionState);
  const editing = Boolean(category);

  return (
    <FormExperience action={action} className="space-y-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div>
        <label htmlFor="name" className="label">Nome da categoria *</label>
        <input id="name" name="name" required defaultValue={category?.name} className="input" placeholder="Ex.: Organização de Estoque" />
      </div>
      <div>
        <label htmlFor="description" className="label">Descrição</label>
        <textarea id="description" name="description" rows={3} defaultValue={category?.description} className="input" placeholder="Objetivo e abrangência desta categoria" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sortOrder" className="label">Ordem de exibição</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} step={1} defaultValue={category?.sortOrder ?? 0} className="input" />
        </div>
        <div>
          <label className="label">Status</label>
          <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-xl border border-ink/20 bg-surface px-3.5">
            <input type="checkbox" name="active" defaultChecked={category?.active ?? true} className="h-4 w-4 accent-brand" />
            <span className="flex items-center gap-2 text-sm font-semibold text-ink/75">
              <FolderTree className="h-4 w-4 text-ink/70" />
              Categoria ativa
            </span>
          </label>
        </div>
      </div>

      <div className="form-actions flex flex-wrap items-center justify-end gap-2 border-t border-ink/10 pt-4">
        <Link href="/categorias" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </FormExperience>
  );
}

