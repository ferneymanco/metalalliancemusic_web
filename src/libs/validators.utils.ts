// validators.util.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function notBlankValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString();
  return v.trim().length ? null : { blank: true };
}

export function notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value as string | null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { dateInvalid: true };

  const today = new Date();
  const dY = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const tY = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dY > tY ? { dateInFuture: true } : null;
}
