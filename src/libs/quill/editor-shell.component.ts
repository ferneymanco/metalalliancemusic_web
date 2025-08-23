// src/libs/quill/editor-shell.component.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  Type,
  inject,
  signal,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-editor-shell',
  standalone: true,
  imports: [CommonModule],
  host: { ngSkipHydration: '' },
  template: `
    <!-- IMPORTANTE: este subárbol cambia post-hidratación; no lo hidrates -->
    <div ngSkipHydration>
      <!-- SSR y primer render del cliente: SIEMPRE muestra el fallback -->
      <ng-container *ngIf="showEditor(); else fallback">
        <!-- Una vez hidratado y en navegador: cargamos el editor real -->
        <ng-container [ngComponentOutlet]="editorComp()"></ng-container>
      </ng-container>

      <ng-template #fallback>
        <textarea
          rows="6"
          style="width:100%;"
          placeholder="El editor se cargará en el navegador..."
        ></textarea>
      </ng-template>
    </div>
  `,
})
export class EditorShellComponent {
  private platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  editorComp = signal<Type<any> | null>(null);
  showEditor = signal(false);

  constructor() {
    if (!this.isBrowser) return;

    // Ejecuta DESPUÉS de la hidratación del primer render del cliente
    afterNextRender(async () => {
      // Carga perezosa del componente real del editor (que hace import('quill') en ngOnInit)
      const m = await import(
        '../../app/admin/anniversaries-form-wysiwyg/anniversaries-form-wysiwyg.component'
      );
      this.editorComp.set(m.EditorSecureComponent);
      this.showEditor.set(true);
    });
  }
}
