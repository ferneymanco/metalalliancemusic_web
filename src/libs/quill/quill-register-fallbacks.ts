import Quill from 'quill';

/** Asegura ALIGN con clases (ql-align-*) */
(function ensureAlign() {
  try {
    Quill.import('formats/align'); // si existe, listo
  } catch {
    const Parchment = Quill.import('parchment');
    // Usa CLASES: ql-align-center / ql-align-right / ql-align-justify
    const AlignClass = new (Parchment as any).ClassAttributor(
      'align', // nombre del formato
      'ql-align', // prefijo de clase
      {
        scope: (Parchment as any).Scope.BLOCK,
        whitelist: ['center', 'right', 'justify'],
      }
    );
    Quill.register(AlignClass, true);
  }
})();
