TP Integrador - Administración de Memoria
Descripción
Este proyecto es un simulador interactivo de administración de memoria para sistemas operativos, desarrollado como trabajo práctico integrador. Permite cargar procesos desde archivos, configurar parámetros de simulación y visualizar la asignación dinámica de memoria utilizando diferentes estrategias.

Funcionalidades principales
Carga de procesos desde archivos .json o .txt con validación automática.
Configuración de simulación: tamaño total de memoria, memoria reservada para el sistema operativo, tiempos de selección/carga/liberación de partición y estrategia de asignación.
Estrategias de asignación: First Fit, Next Fit, Best Fit y Worst Fit.
Simulación paso a paso con registro de eventos y visualización de la memoria en tiempo real.
Cálculo de métricas: turnaround (retorno), fragmentación externa, tiempos acumulados.
Visualización gráfica de la memoria y resultados en tabla.
Descarga de resultados en formatos TXT, JSON y PDF.
Diagramas de clases, arquitectura, flujo y secuencia incluidos para documentación.


Estructura del proyecto
integrador/
├── index.html
├── style.css
├── README.md
├── scripts/
│   ├── main.js
│   ├── ui.js
│   ├── contigua.js
│   ├── memoria.js
│   ├── algoritmos.js
│   ├── validacion.js
│   ├── descarga.js
│   └── control.js
├── diagramas/
│   ├── diagrama_clases.puml
│   ├── diagrama-arquitectura.puml
│   ├── diagrama-flujo.puml
│   └── diagrama-secuencia.puml
├── memoria_8p.json
├── memoria_9p.json
├── memoria_10p.json
├── tanda.json
└── TrabajoPracticoSO.pdf

Uso
Abre link en tu navegador.
Carga un archivo de procesos válido (.json o .txt).
Configura los parámetros de simulación según tus necesidades.
Selecciona la estrategia de asignación y ejecuta la simulación.
Visualiza los resultados, la memoria y descarga los resultados si lo deseas.

Requisitos
Navegador web moderno (Chrome, Firefox, Edge, etc.).
No requiere instalación de dependencias externas.

Créditos
Trabajo realizado por Tayra Aguila para la materia Sistemas Operativos.