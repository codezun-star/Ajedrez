---
title: "Chess Elo Rating: What It Is, How It's Calculated, How to Raise It"
description: "What your Elo actually means, the real formula behind it, what each rating band represents, and the five things that genuinely make it go up."
date: "2026-07-14"
lang: en
slug: chess-elo-rating-explained
cluster: elo
tags: ["chess elo", "what is elo", "raise your rating", "chess ranking", "rating levels"]
---

# Chess Elo Rating: What It Is, How It's Calculated, How to Raise It

Your Elo is the number that sums up your strength as a player. It doesn't measure
how many games you win — it measures **who you beat**. Beating someone 400 points
above you is worth a lot; beating someone 400 points below you is worth almost
nothing.

This article explains where that number comes from, what yours means, and what
actually makes it rise.

## What the Elo system is

It was created by **Arpad Elo**, a Hungarian-American physicist, and FIDE adopted
it in 1970. The idea is simple: every player has a rating, and the gap between two
ratings **predicts the expected result** of the game.

Win more than the system predicts and you go up. Win less and you go down. That's
the whole thing.

## How it's actually calculated

There are two steps.

### Step 1: the expected score

Your chance of winning is calculated like this, where `Ra` is your rating and `Rb`
your opponent's:

```
E = 1 / (1 + 10^((Rb - Ra) / 400))
```

The figure **400** is the heart of the system: a 400-point gap means the favourite
should win roughly **10 games out of 11**.

Some examples:

| Rating gap | Favourite's expected score |
| --- | --- |
| 0 points | 50% |
| 100 points | 64% |
| 200 points | 76% |
| 400 points | 91% |

### Step 2: the adjustment

```
New rating = current rating + K × (actual score − expected score)
```

The **actual score** is 1 for a win, 0.5 for a draw and 0 for a loss.

**K** decides how much your rating moves per game. In FIDE:

- **K = 40** for new players (fewer than 30 games).
- **K = 20** for most players.
- **K = 10** above 2400.

That's why your rating swings wildly at first: the system doesn't yet know your
real level and moves fast to find it.

### A worked example

You're 1200 and you beat someone rated 1400. Your expected score was
`1 / (1 + 10^(200/400)) = 0.24`. With K = 40:

```
1200 + 40 × (1 − 0.24) = 1200 + 30.4 ≈ 1230
```

You gain 30 points. Had you lost that same game you'd have dropped only about 10,
because losing to a stronger player was already priced in.

## What your number means

These bands are approximate, but they'll place you:

| Elo | Level |
| --- | --- |
| Under 1200 | Beginner: you know the rules, still hang pieces |
| 1200 – 1400 | Novice: you spot one-move tactics |
| 1400 – 1600 | Intermediate: you plan and calculate two or three moves |
| 1600 – 1800 | Strong club player: few serious tactical errors |
| 1800 – 2000 | Advanced: solid endgame technique |
| 2000 – 2200 | Expert / candidate master |
| 2200 – 2400 | FIDE Master and International Master territory |
| 2500+ | Grandmaster |

**Careful comparing ratings across sites.** A website's Elo is not a FIDE Elo:
every platform has its own player pool and its own constants. A 200- or 300-point
difference between systems is completely normal.

## The 5 things that genuinely raise your rating

### 1. Stop hanging pieces

Below 1600, most games are lost by giving material away. Before every move, two
questions: **what is my opponent threatening?** and **what of mine is undefended?**

### 2. Tactics every day

Fifteen minutes daily beats three hours on Sunday. Patterns stick through
repetition, not intensity.

### 3. Learn four endgames

King and queen vs king, king and rook vs king, king and pawn vs king, and rook
endings. Converting advantages is where the most points are thrown away on pure
technique.

### 4. Play long games

In blitz you repeat what you already know. With enough time you calculate, get it
wrong, and find out why. That's where progress comes from.

### 5. Review your losses

Export the **PGN** and find the exact move where the game turned. You rarely need
an engine — usually it's visible on your own.

## A word about obsessing over the number

Elo is a thermometer, not a target. It rises when you play better, and playing to
avoid losing points leads to avoiding complicated positions — which is precisely
where the learning happens.

Pick a difficulty where you win roughly **half your games**. That's where learning
is fastest: an opponent who always beats you teaches nothing, and neither does one
you always beat.

<!-- faq -->
## Frequently asked questions

### What is a good chess rating?
It depends on context. Above 1200 you have the basics down, 1600 is a solid club player and 2000 is expert level. The average rated federation player sits around 1600, though online platform averages tend to be lower.

### How exactly is Elo calculated?
In two steps: first the expected score, `E = 1 / (1 + 10^((Rb − Ra)/400))`, then the adjustment, `new rating = rating + K × (actual − expected)`. K is 40 for new players, 20 for most, and 10 above 2400.

### Why do I gain so few points for beating a weaker player?
Because the system already expected you to win. If your expected score was 0.9 and you win, you only collect K × 0.1. The flip side is that losing that game would cost you a great deal.

### Is a website's Elo the same as a FIDE rating?
No. Every platform computes its own Elo with its own player pool and constants, so the numbers aren't directly comparable. Gaps of 200 or 300 points between systems are normal.

### How much can you gain in a year?
With consistent practice a beginner can gain several hundred points within months. Progress slows as you climb: going from 1200 to 1500 is far faster than going from 1900 to 2000.
