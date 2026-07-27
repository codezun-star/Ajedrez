---
title: "Rating Elo no xadrez: o que é, como se calcula e como subir"
description: "O que significa o seu Elo, a fórmula real por trás dele, que nível representa cada faixa de pontos e as cinco coisas que realmente fazem o rating subir."
date: "2026-07-14"
lang: pt
slug: rating-elo-no-xadrez
cluster: elo
tags: ["elo xadrez", "o que é elo", "subir de rating", "ranking xadrez", "níveis de xadrez"]
---

# Rating Elo no xadrez: o que é, como se calcula e como subir

Seu Elo é o número que resume a sua força como jogador. Ele não mede quantas
partidas você ganha, e sim **de quem você ganha**. Vencer alguém 400 pontos acima
vale muitíssimo; vencer alguém 400 pontos abaixo não vale quase nada.

Este artigo explica de onde sai esse número, o que o seu significa e o que fazer
para ele subir.

## O que é o sistema Elo

Foi criado por **Arpad Elo**, físico húngaro-americano, e a FIDE o adotou em 1970.
A ideia é simples: cada jogador tem uma pontuação, e a diferença entre duas
pontuações **prevê o resultado esperado** do confronto.

Se você ganha mais do que o sistema prevê, sobe. Se ganha menos, desce. É só isso.

## Como se calcula de verdade

São dois passos.

### Passo 1: o resultado esperado

A probabilidade de você vencer é calculada assim, onde `Ra` é o seu Elo e `Rb` o
do adversário:

```
E = 1 / (1 + 10^((Rb - Ra) / 400))
```

O número **400** é o coração do sistema: uma diferença de 400 pontos significa que
o favorito deveria vencer cerca de **10 em cada 11 partidas**.

Alguns exemplos:

| Diferença | Resultado esperado do favorito |
| --- | --- |
| 0 pontos | 50% |
| 100 pontos | 64% |
| 200 pontos | 76% |
| 400 pontos | 91% |

### Passo 2: o ajuste

```
Novo Elo = Elo atual + K × (resultado real − resultado esperado)
```

O **resultado real** é 1 se você vence, 0,5 se empata e 0 se perde.

O **K** decide o quanto o seu rating se move por partida. Na FIDE:

- **K = 40** para jogadores novos (menos de 30 partidas).
- **K = 20** para a maioria.
- **K = 10** acima de 2400.

Por isso o seu Elo oscila muito no começo: o sistema ainda não sabe o seu nível
real e se move rápido para descobrir.

### Um exemplo completo

Você tem 1200 e vence alguém de 1400. Seu resultado esperado era
`1 / (1 + 10^(200/400)) = 0,24`. Com K = 40:

```
1200 + 40 × (1 − 0,24) = 1200 + 30,4 ≈ 1230
```

Você ganha 30 pontos. Se tivesse perdido essa mesma partida, perderia só uns 10,
porque perder para alguém mais forte já estava previsto.

## O que o seu número significa

Estas faixas são aproximadas, mas servem para se localizar:

| Elo | Nível |
| --- | --- |
| Abaixo de 1200 | Iniciante: sabe as regras, ainda deixa peças penduradas |
| 1200 – 1400 | Novato: enxerga táticas de um lance |
| 1400 – 1600 | Intermediário: planeja e calcula dois ou três lances |
| 1600 – 1800 | Clube forte: poucos erros táticos graves |
| 1800 – 2000 | Avançado: boa técnica de finais |
| 2000 – 2200 | Expert / candidato a mestre |
| 2200 – 2400 | Mestre FIDE e Mestre Internacional |
| Acima de 2500 | Grande Mestre |

**Cuidado ao comparar Elos de sites diferentes.** O Elo de uma plataforma não é o
da FIDE: cada uma tem a sua própria população de jogadores e as suas constantes.
Uma diferença de 200 ou 300 pontos entre sistemas é totalmente normal.

## As 5 coisas que realmente sobem o seu Elo

### 1. Pare de deixar peças penduradas

Abaixo de 1600, a maioria das partidas é perdida dando material. Antes de cada
lance, duas perguntas: **o que o adversário ameaça?** e **o que meu está sem
defesa?**

### 2. Tática todos os dias

Quinze minutos diários rendem mais que três horas no domingo. Os padrões fixam por
repetição, não por intensidade.

### 3. Aprenda quatro finais

Rei e dama contra rei, rei e torre contra rei, rei e peão contra rei, e finais de
torre. Converter vantagens é onde mais pontos se perdem por pura técnica.

### 4. Jogue partidas longas

No blitz você repete o que já sabe. Com tempo suficiente você calcula, erra e
descobre por quê. É daí que vem o progresso.

### 5. Revise as suas derrotas

Exporte o **PGN** e ache o lance exato em que a partida virou. Raramente precisa de
motor: quase sempre dá para ver sozinho.

## Um conselho sobre a obsessão pelo número

O Elo é um termômetro, não um objetivo. Ele sobe quando você joga melhor, e jogar
pensando em não perder pontos leva a evitar posições complicadas — que é justamente
onde se aprende.

Escolha um nível de dificuldade em que você vença cerca de **metade das partidas**.
É ali que o aprendizado é mais rápido: um adversário que sempre ganha não ensina
nada, e um que você sempre vence, também não.

<!-- faq -->
## Perguntas frequentes

### O que é um bom rating no xadrez?
Depende do contexto. Acima de 1200 você já domina o básico, 1600 é um jogador de clube sólido e 2000 é nível expert. A média dos jogadores federados fica em torno de 1600, embora nas plataformas online a média costume ser mais baixa.

### Como o Elo é calculado exatamente?
Em dois passos: primeiro o resultado esperado, `E = 1 / (1 + 10^((Rb − Ra)/400))`, depois o ajuste, `novo Elo = Elo + K × (real − esperado)`. O K vale 40 para jogadores novos, 20 para a maioria e 10 acima de 2400.

### Por que ganho tão poucos pontos ao vencer alguém mais fraco?
Porque o sistema já esperava a sua vitória. Se o resultado esperado era 0,9 e você vence, leva apenas K × 0,1. O outro lado é que perder essa partida custaria muito caro.

### O Elo de um site é o mesmo da FIDE?
Não. Cada plataforma calcula o próprio Elo com a sua população e as suas constantes, então os números não são diretamente comparáveis. Diferenças de 200 ou 300 pontos entre sistemas são normais.

### Quanto dá para subir de Elo em um ano?
Com prática constante, um iniciante pode subir várias centenas de pontos em alguns meses. O progresso desacelera conforme você sobe: ir de 1200 a 1500 é muito mais rápido do que ir de 1900 a 2000.
