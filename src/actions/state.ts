export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
  resetUrl?: string;
}

export const initialActionState: ActionState = { ok: false };

