# 🖥️ TP Integrador – Administración de Memoria  

![Estado](https://img.shields.io/badge/status-completed-brightgreen)
![Hecho en](https://img.shields.io/badge/made%20with-JavaScript-yellow)
![Plataforma](https://img.shields.io/badge/platform-Web-lightgrey)

## 📌 Descripción  
Este proyecto es un **simulador interactivo de administración de memoria** para sistemas operativos, desarrollado como **Trabajo Práctico Integrador**.  
Permite cargar procesos desde archivos, configurar parámetros de simulación y visualizar la **asignación dinámica de memoria** utilizando diferentes estrategias.  

---

## ✨ Funcionalidades principales  
- 📂 **Carga de procesos** desde archivos `.json` o `.txt` con validación automática.  
- ⚙️ **Configuración de simulación**:  
  - Tamaño total de memoria.  
  - Memoria reservada para el sistema operativo.  
  - Tiempos de selección / carga / liberación de partición.  
  - Estrategia de asignación.  
- 🧩 **Estrategias de asignación implementadas**:  
  - First Fit.  
  - Next Fit.  
  - Best Fit.  
  - Worst Fit.  
- ▶️ **Simulación paso a paso** con registro de eventos y visualización en tiempo real.  
- 📊 **Cálculo de métricas**:  
  - Turnaround (tiempo de retorno).  
  - Fragmentación externa.  
  - Tiempos acumulados.  
- 🖼️ **Visualización gráfica** de la memoria y resultados en tabla.  
- 💾 **Exportación de resultados** en formatos: TXT, JSON y PDF.  
- 📑 **Documentación adicional**: diagramas de clases, arquitectura, flujo y secuencia.  

---

## 📂 Estructura del proyecto  

```plaintext
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

---

## 🚀 Uso
-Abre index.html en tu navegador.
-Carga un archivo de procesos válido (.json o .txt).
-Configura los parámetros de simulación según tus necesidades.
-Selecciona la estrategia de asignación y ejecuta la simulación.
-Visualiza los resultados, la memoria en tiempo real y descarga los reportes si lo deseas.

---

##📋 Requisitos
-Navegador web moderno (Chrome, Firefox, Edge, etc.).
-✅ No requiere instalación de dependencias externas.

---

##👩‍💻 Créditos

-Trabajo realizado por Tayra Aguila
-📚 Materia: Sistemas Operativos