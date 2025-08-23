import Quill from 'quill';

console.log(
  'strike?',
  (() => {
    try {
      Quill.import('formats/strike');
      return 'OK';
    } catch {
      return 'NO';
    }
  })()
);

// Importa los formatos que vas a usar
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Underline from 'quill/formats/underline';
import Strike from 'quill/formats/strike';
import Header from 'quill/formats/header';
import List from 'quill/formats/list';
//import Aligns from 'quill/formats/align';
import CodeBlock from 'quill/formats/code';
import Link from 'quill/formats/link';

//let Aligns = Quill.import('formats/align');
//Aligns.whitelist = ['right', 'left', 'center', 'justify'];

// Regístralos en Quill (true = sobrescribir si ya existieran)
Quill.register(Bold, true);
Quill.register(Italic, true);
Quill.register(Underline, true);
Quill.register(Strike, true);
Quill.register(Header, true);
Quill.register(List, true);
//Quill.register(Aligns, true);
Quill.register(CodeBlock, true);
Quill.register(Link, true);
