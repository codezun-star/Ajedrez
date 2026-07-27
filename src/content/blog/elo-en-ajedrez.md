---
title: "ELO en ajedrez: qué es, cómo se calcula y cómo subirlo"
description: "Qué significa tu ELO, la fórmula real con la que se calcula, qué nivel representa cada rango de puntos y las cinco cosas que de verdad lo hacen subir."
date: "2026-07-14"
lang: es
slug: elo-en-ajedrez
cluster: elo
tags: ["elo ajedrez", "qué es el elo", "subir de elo", "ranking ajedrez", "niveles de ajedrez"]
---

# ELO en ajedrez: qué es, cómo se calcula y cómo subirlo

Tu ELO es el número que resume tu fuerza como jugador. No mide cuántas partidas
ganas, sino **contra quién las ganas**. Ganarle a alguien 400 puntos por encima
vale muchísimo; ganarle a alguien 400 puntos por debajo, casi nada.

Este artículo explica de dónde sale ese número, qué significa el tuyo y qué hacer
para que suba.

## Qué es el sistema ELO

Lo creó **Arpad Elo**, un físico húngaro-estadounidense, y la FIDE lo adoptó en
1970. La idea es simple: cada jugador tiene una puntuación, y la diferencia entre
dos puntuaciones **predice el resultado esperado** del enfrentamiento.

Si ganas más de lo que el sistema predice, subes. Si ganas menos, bajas. Eso es
todo.

## Cómo se calcula, de verdad

Hay dos pasos.

### Paso 1: el resultado esperado

La probabilidad de que ganes se calcula así, donde `Ra` es tu ELO y `Rb` el de tu
rival:

```
E = 1 / (1 + 10^((Rb - Ra) / 400))
```

La cifra **400** es la clave del sistema: una diferencia de 400 puntos significa
que el favorito debería ganar unas **10 de cada 11 veces**.

Algunos ejemplos:

| Diferencia | Probabilidad esperada del favorito |
| --- | --- |
| 0 puntos | 50 % |
| 100 puntos | 64 % |
| 200 puntos | 76 % |
| 400 puntos | 91 % |

### Paso 2: el ajuste

```
Nuevo ELO = ELO actual + K × (resultado real − resultado esperado)
```

El **resultado real** es 1 si ganas, 0,5 si empatas y 0 si pierdes.

La **K** decide cuánto se mueve tu puntuación en cada partida. En la FIDE:

- **K = 40** para jugadores nuevos (menos de 30 partidas).
- **K = 20** para la mayoría.
- **K = 10** por encima de 2400.

Por eso al principio tu ELO oscila mucho: el sistema todavía no sabe cuál es tu
nivel real y se mueve rápido para averiguarlo.

### Un ejemplo completo

Tienes 1200 y ganas a alguien de 1400. Tu resultado esperado era
`1 / (1 + 10^(200/400)) = 0,24`. Con K = 40:

```
1200 + 40 × (1 − 0,24) = 1200 + 30,4 ≈ 1230
```

Ganas 30 puntos. Si hubieras perdido esa misma partida, habrías perdido solo unos
10, porque perder contra alguien más fuerte estaba previsto.

## Qué significa tu número

Estos rangos son orientativos, pero sirven para situarte:

| ELO | Nivel |
| --- | --- |
| Menos de 1200 | Principiante: conoces las reglas, aún cuelgas piezas |
| 1200 – 1400 | Novato: ves las tácticas de un movimiento |
| 1400 – 1600 | Intermedio: planificas y calculas dos o tres jugadas |
| 1600 – 1800 | Club fuerte: pocos errores tácticos graves |
| 1800 – 2000 | Avanzado: buena técnica de finales |
| 2000 – 2200 | Experto / candidato a maestro |
| 2200 – 2400 | Maestro FIDE y Maestro Internacional |
| Más de 2500 | Gran Maestro |

**Ojo con comparar ELOs de sitios distintos.** El ELO de una web no es el de la
FIDE: cada plataforma tiene su propia población y sus propias constantes. Una
diferencia de 200 o 300 puntos entre sistemas es completamente normal.

## Las 5 cosas que de verdad suben tu ELO

### 1. Deja de colgar piezas

Por debajo de 1600, la mayoría de las partidas se pierden regalando material. Antes
de cada jugada, dos preguntas: **¿qué amenaza mi rival?** y **¿qué tengo sin
defender?**

### 2. Táctica todos los días

Quince minutos diarios rinden más que tres horas el domingo. Los patrones se fijan
por repetición, no por intensidad.

### 3. Aprende cuatro finales

Rey y dama contra rey, rey y torre contra rey, rey y peón contra rey, y torres con
peones. Convertir ventajas es donde más puntos se pierden por pura técnica.

### 4. Juega partidas largas

En blitz repites lo que ya sabes. Con tiempo suficiente calculas, te equivocas y
descubres por qué. El progreso viene de ahí.

### 5. Revisa tus derrotas

Exporta el **PGN** y busca la jugada exacta en la que se torció la partida. No hace
falta un motor: casi siempre se ve solo.

## Un consejo sobre la obsesión con el número

El ELO es un termómetro, no un objetivo. Sube cuando juegas mejor, y jugar
pensando en no perder puntos lleva a evitar posiciones complicadas — que es
justamente donde se aprende.

Elige un nivel de dificultad donde ganes aproximadamente **la mitad de las
partidas**. Ahí es donde el aprendizaje es más rápido: un rival que te gana siempre
no enseña nada, y uno al que ganas siempre, tampoco.

<!-- faq -->
## Preguntas frecuentes

### ¿Qué es un buen ELO en ajedrez?
Depende del contexto. Por encima de 1200 ya dominas lo básico, 1600 es un jugador de club sólido y 2000 es nivel experto. La media de los jugadores federados ronda los 1600, pero en plataformas online la media suele ser más baja.

### ¿Cómo se calcula el ELO exactamente?
Con dos pasos: primero el resultado esperado, `E = 1 / (1 + 10^((Rb − Ra)/400))`, y después el ajuste, `nuevo ELO = ELO + K × (resultado real − esperado)`. La K vale 40 para jugadores nuevos, 20 para la mayoría y 10 por encima de 2400.

### ¿Por qué gano pocos puntos cuando venzo a alguien más débil?
Porque el sistema ya esperaba que ganaras. Si tu resultado esperado era 0,9 y ganas, solo te llevas K × 0,1. La otra cara es que perder esa partida te costaría muchísimo.

### ¿El ELO de una web es el mismo que el de la FIDE?
No. Cada plataforma calcula su propio ELO con su población y sus constantes, así que los números no son comparables directamente. Diferencias de 200 o 300 puntos entre sistemas son normales.

### ¿Cuánto se puede subir de ELO en un año?
Con práctica constante, un principiante puede subir varios cientos de puntos en unos meses. El progreso se frena a medida que subes: pasar de 1200 a 1500 es mucho más rápido que pasar de 1900 a 2000.
