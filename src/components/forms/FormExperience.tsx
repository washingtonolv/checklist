"use client";

import { Children, cloneElement, Fragment, isValidElement, useEffect, useRef, useState, type ReactNode, type ComponentProps } from "react";
import { ProgressBar } from "@/components/ui";

/** Native validation, inline recovery and progress without storing personal data. */
export function FormExperience({ children, ...props }: ComponentProps<"form">) {
  const ref = useRef<HTMLFormElement>(null);
  const [progress, setProgress] = useState({ complete: 0, total: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  function update() {
    const fields = Array.from(ref.current?.elements ?? []).filter((el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) && el.required && !el.disabled && el.type !== "hidden");
    setProgress({ complete: fields.filter(el => el.value.trim() && el.validity.valid).length, total: fields.length });
  }
  useEffect(() => { update(); }, [children]);
  function validate(field: EventTarget) {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) || !field.id) return;
    const message = field.validity.valid ? "" : field.validity.valueMissing ? "Preencha este campo para continuar." : field.type === "email" ? "Informe um e-mail válido, como nome@empresa.com." : field.name === "username" ? "Use de 3 a 40 letras, números, ponto, hífen ou sublinhado, sem espaços." : field.validationMessage;
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (message) field.setAttribute("aria-describedby", `${field.id}-error`);
    else field.removeAttribute("aria-describedby");
    setErrors(old => ({ ...old, [field.id]: message }));
  }
  function withErrors(nodes: ReactNode): ReactNode {
    return Children.map(nodes, node => {
      if (!isValidElement<{ id?: string; children?: ReactNode }>(node)) return node;
      const id = node.props.id;
      const element = node.props.children ? cloneElement(node, {}, withErrors(node.props.children)) : node;
      return id && errors[id] ? <Fragment>{element}<p id={`${id}-error`} className="mt-1 text-sm text-danger">{errors[id]}</p></Fragment> : element;
    });
  }
  return <form {...props} ref={ref} onInput={event => { setTouched(true); update(); if ((event.target as HTMLElement).getAttribute("aria-invalid") === "true") validate(event.target); }} onBlur={event => validate(event.target)} onInvalid={event => validate(event.target)}>
    {progress.total > 2 && <div className="rounded-xl border border-line p-4">
      <ProgressBar value={progress.complete / progress.total * 100} label={`${progress.complete} de ${progress.total} campos obrigatórios preenchidos`} />
      <p className="hint">{progress.complete === progress.total ? "Tudo preenchido. Revise os dados e salve para concluir." : "Preencha os campos com *. As informações só serão salvas ao confirmar."}</p>
    </div>}
    {withErrors(children)}
    {Object.entries(errors).some(([, message]) => message) && <div role="alert" className="status-danger rounded-lg p-3 text-sm"><p className="font-semibold">Revise os campos indicados:</p>{Object.entries(errors).filter(([, message]) => message).map(([id, message]) => <p key={id}><a className="link" href={`#${id}`} onClick={() => document.getElementById(id)?.focus()}>{ref.current?.querySelector(`label[for="${id}"]`)?.textContent ?? "Campo"}</a>: {message}</p>)}</div>}
    {touched && <p className="hint">Alterações ainda não salvas. Use o botão de confirmação para finalizar.</p>}
  </form>;
}
