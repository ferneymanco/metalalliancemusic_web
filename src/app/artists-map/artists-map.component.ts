import { Component, ElementRef, Input, OnChanges, OnDestroy, AfterViewInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import cytoscape, { EdgeDefinition, ElementDefinition, NodeDefinition } from 'cytoscape';

export type Membresia = {
  musico: string;
  banda: string;
  desde?: number; // opcional (p.ej. 1994)
  hasta?: number; // opcional (p.ej. 1997)
};

@Component({
  selector: 'app-artists-map',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './artists-map.component.html',
  styleUrl: './artists-map.component.scss'
})

export class ArtistsMapComponent  implements AfterViewInit, OnChanges, OnDestroy {

   data: Membresia[] = EJEMPLO_MEMBRESIAS;

  @ViewChild('cyHost', { static: false }) cyHost!: ElementRef<HTMLDivElement>; // host del grafo

  /** Lista de relaciones Músico->Banda (entrada del componente). */
  @Input() membresias: Membresia[] = EJEMPLO_MEMBRESIAS; // por defecto, demo interna

  /** Tamaño base del nodo; el grado del nodo lo incrementa. */
  @Input() tamanoNodoBase = 28;

  /** Layout actual. Cambia en la UI y se re-ejecuta. */
  @Input() layout: 'cose' | 'concentric' | 'circle' | 'grid' = 'cose';

  /** Parámetros de UI */
  minPeso = 1; // umbral mínimo para mostrar una arista
  maxPeso = 1; // se calcula a partir de los datos
  busqueda = '';

  // Instancia Cytoscape y elementos calculados
  private cy?: cytoscape.Core;
  private elementos: ElementDefinition[] = [];

  // ===== Ciclo de vida =====
  ngAfterViewInit(): void {
    // Cuando el host existe en el DOM, construimos elementos y montamos Cytoscape
    this.reconstruir();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambian entradas relevantes y ya existe el grafo, lo reconstruimos
    if (this.cy && (changes['membresias'] || changes['tamanoNodoBase'])) {
      this.reconstruir();
    }
  }

  ngOnDestroy(): void {
    // Limpieza: destruir la instancia de Cytoscape al desmontar el componente
    this.cy?.destroy();
  }

  /**
   * Proyección bipartita → bandas
   * ------------------------------
   * A partir de membresías (musico→banda) calculamos:
   * - Nodos: cada banda encontrada
   * - Aristas: entre cada par de bandas conectadas por ≥1 músico
   * - Peso de arista = número de músic@s compartidos (y guardamos la lista)
   */
  private construirElementos(): ElementDefinition[] {
    // 1) Coleccionar todas las bandas
    const bandas = new Set<string>();
    for (const m of this.membresias) bandas.add(m.banda);

    // 2) Mapear músic@ -> Set de bandas (para luego generar combinaciones)
    const musicoABandas = new Map<string, Set<string>>();
    for (const m of this.membresias) {
      if (!musicoABandas.has(m.musico)) musicoABandas.set(m.musico, new Set());
      musicoABandas.get(m.musico)!.add(m.banda);
    }

    // 3) Para cada músic@ con ≥2 bandas, generamos todas las parejas (combinatoria)
    type InfoArista = { peso: number; musicos: Set<string>; };
    const aristas = new Map<string, InfoArista>(); // clave estable: "A||B" con A<B

    for (const [musico, bands] of musicoABandas.entries()) {
      const lista = Array.from(bands);
      if (lista.length < 2) continue; // si solo tocó en una banda, no aporta aristas
      for (let i = 0; i < lista.length; i++) {
        for (let j = i + 1; j < lista.length; j++) {
          const a = lista[i];
          const b = lista[j];
          const [A, B] = a < b ? [a, b] : [b, a]; // orden lexicográfico para una sola clave
          const key = `${A}||${B}`;
          if (!aristas.has(key)) aristas.set(key, { peso: 0, musicos: new Set() });
          const info = aristas.get(key)!;
          info.peso += 1;           // sumamos 1 por este músic@
          info.musicos.add(musico); // guardamos quién conecta
        }
      }
    }

    // 4) Calcular grado (nº de vecinos) para dimensionar nodos
    const vecinosPorBanda = new Map<string, Set<string>>();
    for (const key of aristas.keys()) {
      const [A, B] = key.split('||');
      if (!vecinosPorBanda.has(A)) vecinosPorBanda.set(A, new Set());
      if (!vecinosPorBanda.has(B)) vecinosPorBanda.set(B, new Set());
      vecinosPorBanda.get(A)!.add(B);
      vecinosPorBanda.get(B)!.add(A);
    }

    // 5) Construir nodos (label, grado y tamaño derivado)
    const nodos: NodeDefinition[] = Array.from(bandas).map((b) => {
      const grado = vecinosPorBanda.get(b)?.size ?? 0;
      const size = this.tamanoNodoBase + Math.min(40, grado * 4); // cap suave
      return { data: { id: b, label: b, grado, size } };
    });

    // 6) Construir aristas (peso + lista de músic@s)
    const edges: EdgeDefinition[] = Array.from(aristas.entries()).map(([key, info]) => {
      const [A, B] = key.split('||');
      return {
        data: {
          id: key,
          source: A,
          target: B,
          peso: info.peso,
          musicos: Array.from(info.musicos).sort(), // útil para tooltips o panel lateral
          label: `${info.peso}` // disponible si quieres mostrar etiquetas de arista
        }
      };
    });

    // 7) Guardar el peso máximo para ajustar el rango del slider
    this.maxPeso = edges.reduce((m, e) => Math.max(m, (e.data as any).peso as number), 1);
    if (this.minPeso > this.maxPeso) this.minPeso = this.maxPeso; // consistencia UI

    return [...nodos, ...edges];
  }

  /** Inicializa/recarga Cytoscape con elementos + estilos + interacciones */
  private initCy(): void {
    if (!this.cyHost?.nativeElement) return;

    // Si existía una instancia previa (por cambios de datos), destruimos para evitar fugas
    this.cy?.destroy();

    this.cy = cytoscape({
      container: this.cyHost.nativeElement, // host del canvas
      elements: this.elementos,             // nodos + aristas
      layout: this.obtenerLayout(),         // layout inicial
      style: [
        // Estilo de nodos
        {
          selector: 'node',
          style: {
            'background-color': '#60a5fa',
            'label': 'data(label)',
            'color': '#111827',
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'overlay-opacity': 0, // quitar overlay azul al pasar el mouse
            'z-index': 1
          }
        },
        // Estilo de aristas
        {
          selector: 'edge',
          style: {
            'line-color': '#9ca3af',
            'width': 'mapData(peso, 1, 6, 1, 6)', // grosor proporcional al peso (rango simple)
            'curve-style': 'haystack',            // más performante para grafos densos
            'haystack-radius': 0.6,
            'opacity': 0.9,
            'label': '',
            'z-index': 0
          }
        },
        // Clases utilitarias para interacciones
        { selector: '.oculta', style: { 'display': 'none' } },
        { selector: '.aten', style: { 'opacity': 0.15 } },
        { selector: '.resaltado', style: { 'border-width': 4, 'border-color': '#2563eb' } },
        { selector: '.vecino', style: { 'background-color': '#34d399' } },
        { selector: 'edge.resaltado', style: { 'line-color': '#2563eb', 'opacity': 1 } }
      ]
    });

    // Interacción: click en nodo → resaltar vecindad
    this.cy.on('tap', 'node', (evt) => this.resaltarVecindad(evt.target));
    // Click en el fondo → limpiar resaltado
    this.cy.on('tap', (evt) => { if (evt.target === this.cy) this.limpiarResaltado(); });

    // Aplicar estado inicial del filtro (según minPeso)
    this.aplicarFiltro();

    // Hacer fit al contenedor tras montar
    setTimeout(() => this.cy!.fit(undefined, 30), 0);
  }

  /** Resalta nodo + vecinos + aristas y centra la vista sobre esa vecindad */
  private resaltarVecindad(nodo: cytoscape.NodeSingular): void {
    if (!this.cy) return;
    this.cy.elements().removeClass('aten resaltado vecino'); // limpiar estados previos

    const neighborhood = nodo.closedNeighborhood(); // nodo + aristas incidentes + vecinos
    this.cy.elements().not(neighborhood).addClass('aten'); // atenuar el resto
    nodo.addClass('resaltado');
    nodo.neighborhood('node').addClass('vecino');
    nodo.neighborhood('edge').addClass('resaltado');

    this.cy.fit(neighborhood, 40); // acercar a la vecindad
  }

  /** Elimina clases de resaltado/atenuación y hace fit global */
  private limpiarResaltado(): void {
    if (!this.cy) return;
    this.cy.elements().removeClass('aten resaltado vecino');
    this.cy.fit(undefined, 30);
  }

  resetVista(): void { this.limpiarResaltado(); }

  /** Muestra/oculta aristas según el umbral actual (minPeso) */
  aplicarFiltro(): void {
    if (!this.cy) return;
    const umbral = this.minPeso;
    this.cy.edges().forEach(e => {
      const peso = (e.data('peso') as number) ?? 1;
      e.toggleClass('oculta', peso < umbral); // si el peso es menor, ocultar
    });
  }

  /** Busca por label del nodo y enfoca el primer match */
  enfocarBusqueda(): void {
    if (!this.cy) return;
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return;

    const candidatos = this.cy.nodes().filter(n => (n.data('label') as string).toLowerCase().includes(q));
    if (candidatos.length > 0) {
      const n = candidatos[0];
      this.resaltarVecindad(n);
    }
  }

  /** Reaplica el layout seleccionado */
  reLayout(): void {
    if (!this.cy) return;
    this.cy.layout(this.obtenerLayout()).run();
  }

  /** Devuelve las opciones de layout según el valor actual */
  private obtenerLayout(): cytoscape.LayoutOptions {
    switch (this.layout) {
      case 'concentric':
        // concentric: radios por nivel; usamos el grado como "peso" para poner al centro los más conectados
        return { name: 'concentric', concentric: (n: { degree: () => any; }) => n.degree(), levelWidth: () => 1, padding: 30 } as any;
      case 'circle':
        return { name: 'circle', padding: 30 } as any;
      case 'grid':
        return { name: 'grid', padding: 30 } as any;
      default:
        // cose: layout de fuerzas por defecto (bueno para grafos generales)
        return { name: 'cose', fit: true, padding: 30, animate: false } as any;
    }
  }

  /** Reconstruye los elementos y reinicializa Cytoscape */
  private reconstruir(): void {
    this.elementos = this.construirElementos();
    this.initCy();
  }
}

/**
 * Datos de ejemplo mínimos para probar el componente.
 * Puedes reemplazar por tus datos reales: lista de { musico, banda }.
 */
export const EJEMPLO_MEMBRESIAS: Membresia[] = [
  // Nirvana / Foo Fighters / QOTSA / Eagles of Death Metal / RHCP / Atoms for Peace / Radiohead
  { musico: 'Dave Rotten', banda: 'Avulsed' },
  { musico: 'Dave Rotten', banda: 'Christ Denied' },
  { musico: 'Dave Rotten', banda: 'Decrapted' },
  { musico: 'Dave Rotten', banda: 'Holycide' },
  { musico: 'Dave Rotten', banda: 'Putrevore' },
  { musico: 'Dave Rotten', banda: 'Rotten' },
  { musico: 'Dave Rotten', banda: 'Weaponry' },
  { musico: 'Dave Rotten', banda: 'Yskelgroth' },
  { musico: 'Alek Sanders', banda: 'Avulsed' },
  { musico: 'Alek Sanders', banda: 'Pärsec' },
  { musico: 'Alek Sanders', banda: 'Sepulcration' },
  { musico: 'Alek Sanders', banda: 'Umbraeternum' },
  { musico: 'Víctor', banda: 'Avulsed' },
  { musico: 'GoG', banda: 'Avulsed' },
  { musico: 'GoG', banda: 'Buriality' },
  { musico: 'GoG', banda: 'Holycide' },
  { musico: 'GoG', banda: 'Inania Regna' },
  { musico: 'Alejandro Lobo', banda: 'Avulsed' },
  { musico: 'Alejandro Lobo', banda: 'Dissonath' },
  { musico: 'Alejandro Lobo', banda: 'Holycide' },
  { musico: 'Alejandro Lobo', banda: 'Krueger' },
  { musico: 'Alejandro Lobo', banda: 'Misanthropy' },
  { musico: 'Roger Borrull', banda: 'Christ Denied' },
  { musico: 'Roger Borrull', banda: 'Confined' },
  { musico: 'Roger Borrull', banda: 'Infected Flesh' },
  { musico: 'Roger Borrull', banda: 'Tibosity' },
  { musico: 'Roger P.', banda: 'Christ Denied' },
  { musico: 'Roger P.', banda: 'Tibosity' },
  { musico: 'Fabio Ramirez', banda: 'Christ Denied' },
  { musico: 'Fabio Ramirez', banda: 'Eternal Slavery' },
  { musico: 'Fabio Ramirez', banda: 'Human Violence' },
  { musico: 'Vicente Payá', banda: 'Decrapted' },
  { musico: 'Luis Bolívar', banda: 'Holycide' },
  { musico: 'Rogga Johansson', banda: 'Putrevore' },
  { musico: 'Jo Steel', banda: 'Weaponry' },
  { musico: 'Nexus 6', banda: 'Yskelgroth' },
  { musico: 'Vicente J.', banda: 'Yskelgroth' }
];
