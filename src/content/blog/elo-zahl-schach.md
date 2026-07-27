---
title: "Elo-Zahl im Schach: was sie ist, wie sie berechnet wird, wie du sie steigerst"
description: "Was deine Elo-Zahl bedeutet, die tatsächliche Formel dahinter, welches Niveau jede Punktespanne beschreibt und die fünf Dinge, die sie wirklich steigen lassen."
date: "2026-07-14"
lang: de
slug: elo-zahl-schach
cluster: elo
tags: ["elo schach", "was ist elo", "elo steigern", "schach rangliste", "spielstärke"]
---

# Elo-Zahl im Schach: was sie ist, wie sie berechnet wird, wie du sie steigerst

Deine Elo-Zahl fasst deine Spielstärke in einer Zahl zusammen. Sie misst nicht, wie
viele Partien du gewinnst, sondern **gegen wen**. Jemanden zu schlagen, der 400
Punkte über dir steht, ist enorm viel wert; jemanden 400 Punkte unter dir zu
schlagen, fast nichts.

Dieser Artikel erklärt, woher die Zahl kommt, was deine bedeutet und was sie
tatsächlich nach oben bringt.

## Was das Elo-System ist

Entwickelt hat es **Arpad Elo**, ein ungarisch-amerikanischer Physiker; die FIDE
übernahm es 1970. Die Idee ist simpel: Jeder Spieler hat eine Wertungszahl, und die
Differenz zwischen zwei Zahlen **sagt das erwartete Ergebnis** der Partie voraus.

Gewinnst du mehr, als das System vorhersagt, steigst du. Gewinnst du weniger,
fällst du. Mehr ist es nicht.

## Wie sie tatsächlich berechnet wird

In zwei Schritten.

### Schritt 1: die Erwartung

Deine Gewinnwahrscheinlichkeit wird so berechnet, wobei `Ra` deine Zahl ist und
`Rb` die des Gegners:

```
E = 1 / (1 + 10^((Rb - Ra) / 400))
```

Die **400** ist das Herz des Systems: Ein Abstand von 400 Punkten bedeutet, dass
der Favorit etwa **10 von 11 Partien** gewinnen sollte.

Ein paar Beispiele:

| Differenz | Erwartung des Favoriten |
| --- | --- |
| 0 Punkte | 50 % |
| 100 Punkte | 64 % |
| 200 Punkte | 76 % |
| 400 Punkte | 91 % |

### Schritt 2: die Anpassung

```
Neue Elo = aktuelle Elo + K × (tatsächliches Ergebnis − Erwartung)
```

Das **tatsächliche Ergebnis** ist 1 bei Sieg, 0,5 bei Remis und 0 bei Niederlage.

Der **K-Faktor** bestimmt, wie stark sich deine Zahl pro Partie bewegt. Bei der
FIDE:

- **K = 40** für neue Spieler (weniger als 30 Partien).
- **K = 20** für die meisten.
- **K = 10** oberhalb von 2400.

Deshalb schwankt deine Zahl anfangs stark: Das System kennt dein wahres Niveau noch
nicht und bewegt sich schnell, um es zu finden.

### Ein durchgerechnetes Beispiel

Du hast 1200 und schlägst jemanden mit 1400. Deine Erwartung war
`1 / (1 + 10^(200/400)) = 0,24`. Mit K = 40:

```
1200 + 40 × (1 − 0,24) = 1200 + 30,4 ≈ 1230
```

Du gewinnst 30 Punkte. Hättest du dieselbe Partie verloren, wären es nur etwa 10
gewesen — gegen einen Stärkeren zu verlieren war ja eingepreist.

## Was deine Zahl bedeutet

Diese Spannen sind Richtwerte, aber sie ordnen dich ein:

| Elo | Niveau |
| --- | --- |
| Unter 1200 | Anfänger: Regeln sitzen, Figuren gehen noch verloren |
| 1200 – 1400 | Einsteiger: Ein-Zug-Taktiken werden gesehen |
| 1400 – 1600 | Fortgeschritten: Pläne und zwei bis drei Züge Rechnen |
| 1600 – 1800 | Starker Vereinsspieler: kaum grobe taktische Fehler |
| 1800 – 2000 | Weit fortgeschritten: solide Endspieltechnik |
| 2000 – 2200 | Experte / Anwärter auf den Meistertitel |
| 2200 – 2400 | FIDE-Meister und Internationaler Meister |
| Über 2500 | Großmeister |

**Vorsicht beim Vergleich zwischen Seiten.** Die Elo einer Plattform ist keine
FIDE-Elo: Jede hat ihre eigene Spielerpopulation und ihre eigenen Konstanten. Ein
Unterschied von 200 oder 300 Punkten zwischen Systemen ist völlig normal.

## Die 5 Dinge, die deine Elo wirklich steigern

### 1. Hör auf, Figuren einzustellen

Unterhalb von 1600 gehen die meisten Partien durch verschenktes Material verloren.
Vor jedem Zug zwei Fragen: **Was droht mein Gegner?** und **Was von mir steht
ungedeckt?**

### 2. Täglich Taktik

Fünfzehn Minuten am Tag bringen mehr als drei Stunden am Sonntag. Muster verankern
sich durch Wiederholung, nicht durch Intensität.

### 3. Lerne vier Endspiele

König und Dame gegen König, König und Turm gegen König, König und Bauer gegen
König sowie Turmendspiele. Beim Verwerten von Vorteilen gehen die meisten Punkte
aus reiner Technik verloren.

### 4. Spiele lange Partien

Im Blitz wiederholst du, was du schon kannst. Mit genug Zeit rechnest du, irrst
dich und findest heraus, warum. Daher kommt der Fortschritt.

### 5. Analysiere deine Niederlagen

Exportiere das **PGN** und suche den Zug, an dem die Partie kippte. Eine Engine
brauchst du selten — meist sieht man es selbst.

## Ein Wort zur Fixierung auf die Zahl

Elo ist ein Thermometer, kein Ziel. Sie steigt, wenn du besser spielst — und zu
spielen, um keine Punkte zu verlieren, führt dazu, komplizierte Stellungen zu
meiden. Genau dort lernt man aber.

Wähle eine Schwierigkeit, bei der du etwa **die Hälfte deiner Partien** gewinnst.
Dort lernst du am schnellsten: Ein Gegner, der immer gewinnt, lehrt nichts — und
einer, den du immer schlägst, ebenso wenig.

<!-- faq -->
## Häufige Fragen

### Was ist eine gute Elo-Zahl?
Das hängt vom Kontext ab. Über 1200 sitzen die Grundlagen, 1600 ist ein solider Vereinsspieler und 2000 Expertenniveau. Der Durchschnitt gewerteter Vereinsspieler liegt bei etwa 1600, online sind die Durchschnitte meist niedriger.

### Wie genau wird Elo berechnet?
In zwei Schritten: zuerst die Erwartung, `E = 1 / (1 + 10^((Rb − Ra)/400))`, dann die Anpassung, `neue Elo = Elo + K × (tatsächlich − erwartet)`. K ist 40 für neue Spieler, 20 für die meisten und 10 oberhalb von 2400.

### Warum bekomme ich so wenige Punkte gegen schwächere Gegner?
Weil das System deinen Sieg ohnehin erwartet hat. War deine Erwartung 0,9 und du gewinnst, bekommst du nur K × 0,1. Die Kehrseite: Eine Niederlage in derselben Partie würde dich viel kosten.

### Ist die Elo einer Website dieselbe wie die FIDE-Elo?
Nein. Jede Plattform berechnet ihre eigene Elo mit eigener Population und eigenen Konstanten, die Zahlen sind also nicht direkt vergleichbar. Unterschiede von 200 oder 300 Punkten zwischen Systemen sind normal.

### Wie viel kann man in einem Jahr zulegen?
Mit regelmäßiger Übung schafft ein Anfänger in wenigen Monaten mehrere hundert Punkte. Der Fortschritt verlangsamt sich nach oben hin: Von 1200 auf 1500 geht deutlich schneller als von 1900 auf 2000.
