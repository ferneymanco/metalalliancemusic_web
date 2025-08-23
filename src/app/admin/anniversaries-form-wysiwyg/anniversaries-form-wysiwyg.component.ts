import {
  Component,
  inject,
  ViewChild,
  signal,
  ElementRef,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { QuillModule, QuillModules } from 'ngx-quill';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule, CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'app-editor-secure',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QuillModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
  ],
  templateUrl: './anniversaries-form-wysiwyg.component.html',
  styleUrl: './anniversaries-form-wysiwyg.component.scss',
})
export class EditorSecureComponent {
  private fb = inject(FormBuilder);
  quillReady = signal(false);
  showHtmlArea = signal(false);

  private editor: any; // instancia de Quill

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(CdkTextareaAutosize) autosize?: CdkTextareaAutosize;

  // Toolbar & whitelist (no incluyen 'clean' ni 'bullet' como formato)
  modules: QuillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [
          { align: '' },
          { align: 'center' },
          { align: 'right' },
          { align: 'justify' },
        ],
        ['link', 'code-block', 'clean', 'image', 'video'],
      ],
    },
    clipboard: { matchVisual: false },
    handlers: {
      image: () => this.handleImageClick(),
      video: () => this.handleVideoClick(),
    },
  };

  formats: string[] = [
    'bold',
    'italic',
    'underline',
    'strike',
    'header',
    'list',
    'align',
    'link',
    'code-block',
    'image',
    'video',
  ];

  form = this.fb.group({
    title: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
      ],
    }),
    bodyDelta: this.fb.control<any>(null),
    bodyHtml: this.fb.control<string>(''),
  });

  get title() {
    return this.form.controls.title;
  }

  recalcularAutosize() {
    this.autosize?.resizeToFitContent(true);
  }

  async ngOnInit() {
    // Solo en navegador
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    // Carga Quill en runtime (evita que el servidor lo evalúe)
    const { default: Quill } = await import('quill');

    // -- ÍCONOS personalizados (Material Symbols) --
    const icons: any = Quill.import('ui/icons');
    icons['bold'] =
      '<span class="material-symbols-outlined">format_bold</span>';
    icons['italic'] =
      '<span class="material-symbols-outlined">format_italic</span>';
    icons['underline'] =
      '<span class="material-symbols-outlined">format_underlined</span>';
    icons['strike'] =
      '<span class="material-symbols-outlined">format_strikethrough</span>';
    icons['link'] = '<span class="material-symbols-outlined">link</span>';
    icons['code-block'] = '<span class="material-symbols-outlined">code</span>';
    icons['clean'] =
      '<span class="material-symbols-outlined">format_clear</span>';
    icons['image'] = '<span class="material-symbols-outlined">image</span>';
    icons['video'] =
      '<span class="material-symbols-outlined">smart_display</span>';
    icons['header'] = icons['header'] || {};
    icons['header']['1'] =
      '<span class="material-symbols-outlined">looks_one</span>';
    icons['header']['2'] =
      '<span class="material-symbols-outlined">looks_two</span>';
    icons['align'] = icons['align'] || {};
    icons['align'][''] =
      '<span class="material-symbols-outlined">format_align_left</span>';
    icons['align']['center'] =
      '<span class="material-symbols-outlined">format_align_center</span>';
    icons['align']['right'] =
      '<span class="material-symbols-outlined">format_align_right</span>';
    icons['align']['justify'] =
      '<span class="material-symbols-outlined">format_align_justify</span>';

    // -- Fallback para ALIGN con clases (si no está) --
    try {
      Quill.import('formats/align');
    } catch {
      const Parchment = Quill.import('parchment');
      const AlignClass = new (Parchment as any).ClassAttributor(
        'align',
        'ql-align',
        {
          scope: (Parchment as any).Scope.BLOCK,
          whitelist: ['center', 'right', 'justify'],
        }
      );
      Quill.register(AlignClass, true);
    }

    this.quillReady.set(true);
  }

  onEditorChanged(e: any) {
    this.form.patchValue(
      {
        bodyDelta: e.delta ?? null,
        bodyHtml: e.html ?? '',
      },
      { emitEvent: false }
    );
    this.recalcularAutosize();
  }

  // --- Handlers del toolbar ---

  // 1) Imagen: file picker -> DataURL (demo)
  handleImageClick() {
    if (!this.editor) return;
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editor) return;

    // ⚠️ Demo: DataURL. En producción: sube a tu storage y usa la URL
    const reader = new FileReader();
    reader.onload = () => {
      const range = this.editor.getSelection(true) || {
        index: this.editor.getLength(),
        length: 0,
      };
      this.editor.insertEmbed(range.index, 'image', reader.result, 'user');
      this.editor.setSelection(range.index + 1, 0);
    };
    reader.readAsDataURL(file);
  }

  // 2) YouTube: URL -> embed
  handleVideoClick() {
    if (!this.editor) return;
    const url = prompt('Pega URL de YouTube (watch, youtu.be o shorts):') || '';
    const embed = this.toYouTubeEmbed(url.trim());
    if (!embed) {
      alert('URL de YouTube inválida o no permitida.');
      return;
    }
    const range = this.editor.getSelection(true) || {
      index: this.editor.getLength(),
      length: 0,
    };
    this.editor.insertEmbed(range.index, 'video', embed, 'user');
    this.editor.setSelection(range.index + 1, 0);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, bodyDelta, bodyHtml } = this.form.value;
    console.log('Guardar:', {
      title,
      description_delta: bodyDelta,
      description_html: bodyHtml,
    });
  }

  /** Convierte distintas URLs de YouTube a /embed/ID, solo YouTube permitido */
  toYouTubeEmbed(raw: string): string | null {
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, '').toLowerCase();

      // Acepta youtube.com, youtu.be
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        // https://youtube.com/watch?v=ID
        if (u.pathname === '/watch' && u.searchParams.get('v')) {
          return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
        }
        // https://youtube.com/shorts/ID
        if (u.pathname.startsWith('/shorts/')) {
          const id = u.pathname.split('/')[2];
          return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        // https://youtube.com/embed/ID
        if (u.pathname.startsWith('/embed/')) return u.toString();
      }
      if (host === 'youtu.be') {
        // https://youtu.be/ID
        const id = u.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
