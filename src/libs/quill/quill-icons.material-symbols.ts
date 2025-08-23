import Quill from 'quill';

// ⚠️ Este archivo se importa por side-effect (no exporta nada)
const icons: any = Quill.import('ui/icons');

// Reemplaza íconos por Material Symbols (asegúrate de cargar la fuente en index.html)
icons['bold'] = '<span class="material-symbols-outlined">format_bold</span>';
icons['italic'] =
  '<span class="material-symbols-outlined">format_italic</span>';
icons['underline'] =
  '<span class="material-symbols-outlined">format_underlined</span>';
icons['link'] = '<span class="material-symbols-outlined">link</span>';
icons['code-block'] = '<span class="material-symbols-outlined">code</span>';
icons['clean'] = '<span class="material-symbols-outlined">format_clear</span>';
// strike (tachado)
icons['strike'] =
  '<span class="material-symbols-outlined">format_strikethrough</span>';

// headers individuales (H1 / H2)
icons['header'] = icons['header'] || {};
icons['header']['1'] =
  '<span class="material-symbols-outlined">looks_one</span>';
icons['header']['2'] =
  '<span class="material-symbols-outlined">looks_two</span>';

// alineación
icons['align'] = icons['align'] || {};
icons['align'][''] =
  '<span class="material-symbols-outlined">format_align_left</span>'; // izquierda (por defecto)
icons['align']['center'] =
  '<span class="material-symbols-outlined">format_align_center</span>';
icons['align']['right'] =
  '<span class="material-symbols-outlined">format_align_right</span>';
icons['align']['justify'] =
  '<span class="material-symbols-outlined">format_align_justify</span>';

// Listas (según versión de Quill puede ser icons.list.ordered/bullet)
if (icons['list']) {
  icons['list']['ordered'] =
    '<span class="material-symbols-outlined">format_list_numbered</span>';
  icons['list']['bullet'] =
    '<span class="material-symbols-outlined">format_list_bulleted</span>';
} else {
  icons['ordered'] =
    '<span class="material-symbols-outlined">format_list_numbered</span>';
  icons['bullet'] =
    '<span class="material-symbols-outlined">format_list_bulleted</span>';
}
