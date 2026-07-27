---
title: "Échec et mat rapide : le mat du berger et 6 autres schémas"
description: "Comment mater en quelques coups et comment s'en défendre : mat du berger, mat du lion, mat du couloir, mat étouffé et les schémas qui décident le plus de parties."
date: "2026-07-26"
lang: fr
slug: echec-et-mat-schemas
cluster: checkmates
tags: ["échec et mat", "mat du berger", "mat en 2 coups", "schémas de mat", "débutants"]
---

# Échec et mat rapide : le mat du berger et 6 autres schémas

Presque toutes les parties en dessous de 1500 Elo se terminent par l'un d'une
demi-douzaine de schémas de mat. Ce ne sont pas des combinaisons géniales : ce
sont des formes répétitives qu'on reconnaît d'un coup d'œil une fois qu'on les a
déjà vues. Ce guide couvre les sept plus fréquents, comment les jouer et —
surtout — **comment éviter de les subir**.

## Ce qu'est exactement l'échec et mat

L'échec et mat, c'est un roi attaqué sans aucune issue légale. Il n'existe que
trois réponses à un échec : bouger le roi, capturer la pièce qui attaque, ou
intercaler une pièce sur la ligne. Si aucune n'est possible, la partie s'arrête
immédiatement.

Attention à la confusion classique : si vous n'avez aucun coup légal mais que
vous n'êtes **pas** en échec, c'est **pat** — nulle, et non défaite.

## 1. Le mat du berger (4 coups)

Le mat le plus célèbre, et celui qui décide le plus de parties de débutants.

```
1. e4 e5
2. Fc4 Cc6
3. Dh5 Cf6??
4. Dxf7#
```

L'idée : la dame et le fou visent tous deux **f7**, la case la plus faible des
noirs puisque seul le roi la défend. Au coup 4, la dame prend en f7 protégée par
le fou de c4, et le roi ne peut ni la capturer ni fuir.

### Comment se défendre

La clé est de ne pas jouer `3...Cf6??`. Deux défenses solides :

- **3...g6**, qui attaque la dame. Après `4.Df3` vous jouez `4...Cf6` et tout va
  bien : le cavalier arrive en f6 *après* avoir chassé la dame.
- **3...De7**, qui défend f7 avec la dame.

La règle générale vaut pour toute l'ouverture : **si l'adversaire braque deux
pièces sur f7 (ou f2 si vous avez les blancs), comptez attaquants et défenseurs
avant de poursuivre votre plan.**

## 2. Le mat du lion (2 coups)

Le mat le plus rapide possible aux échecs. Ce sont les blancs qui le subissent :

```
1. f3 e5
2. g4 Dh4#
```

Pousser les pions f et g ouvre en grand la diagonale e1–h4 jusqu'au roi. Vous ne
le verrez presque jamais en partie réelle, mais il enseigne la leçon la plus
importante de l'ouverture : **chaque pion poussé devant votre roi ouvre une
porte**.

## 3. Le mat du couloir

Le plus fréquent en vraie partie. Le roi a roqué, ses trois pions n'ont pas
bougé, et une tour ou une dame débarque sur la dernière rangée :

- Roi en g1, pions en f2, g2, h2.
- Une tour noire atteint e1 ou d1 → mat, car le roi n'a aucune case de fuite.

### Comment l'éviter

Faites un **trou d'air** : poussez le pion tour (h3 en blancs, h6 en noirs) à un
moment calme. Un seul coup de pion élimine toute cette famille de mats. Et avant
d'échanger les tours, demandez-vous toujours si votre dernière rangée reste sans
défense.

## 4. Le mat étouffé

Un cavalier mate un roi enfermé par ses **propres** pièces. La séquence
classique, appelée *le legs de Philidor* :

```
1. Db3+ Rh8
2. Cf7+ Rg8
3. Ch6++ Rh8
4. Dg8+! Txg8
5. Cf7#
```

Le sacrifice de dame en g8 est la trouvaille : il force la tour à occuper la
dernière case libre du roi. C'est le plus beau schéma de cette liste, et il
survient plus souvent qu'on ne croit quand le roi adverse est confiné.

## 5. Le mat arabe (tour et cavalier)

L'un des plus vieux schémas connus. Cavalier en f6, tour en h7, roi noir en h8 :
le cavalier couvre g8 et h7, et la tour donne mat. Tour et cavalier forment un
duo redoutable contre un roi dans le coin.

## 6. Le mat de l'escalier (deux tours)

Le mat de base que vous devez savoir exécuter sans réfléchir. Avec deux tours (ou
tour et dame), vous fermez les rangées en alternance :

- Une tour sur la 7ᵉ rangée → le roi monte sur la 8ᵉ.
- L'autre tour arrive sur la 8ᵉ → mat.

C'est la technique qui transforme n'importe quel gros avantage en victoire.

## 7. Le mat d'Anastasie

Cavalier en e7, tour qui descend la colonne h, roi noir en h7 avec son pion en
g7. Le cavalier couvre g8 et g6, et la tour conclut sur la colonne h. Très
fréquent quand l'adversaire a poussé le pion h et que vous avez un cavalier
actif.

## Tableau récapitulatif

| Schéma | Pièces | Quand il apparaît |
| --- | --- | --- |
| Berger | Dame + fou | Ouvertures en e4, contre des débutants |
| Lion | Dame | Uniquement si l'adversaire joue f et g |
| Couloir | Tour ou dame | Milieu de partie et finale, roi sans trou d'air |
| Étouffé | Cavalier + dame | Roi enfermé par ses propres pièces |
| Arabe | Tour + cavalier | Roi dans le coin |
| Escalier | Deux tours | Finales avec avantage matériel |
| Anastasie | Cavalier + tour | Roi avec la colonne h ouverte |

## Comment les travailler vraiment

Reconnaître un schéma, c'est de la mémoire visuelle, pas du calcul. Trois
habitudes efficaces :

1. **Avant chaque coup, regardez la dernière rangée adverse.** A-t-elle un trou
   d'air ? Sinon, cherchez à y glisser une tour.
2. **Comptez attaquants et défenseurs sur f7 / f2** pendant toute l'ouverture.
3. **Jouez contre l'IA en niveau Facile et forcez-vous à conclure par un schéma
   précis.** Gagner au matériel est facile ; chercher le mat entraîne l'œil.

Quand ces sept schémas viendront tout seuls, vous aurez laissé derrière vous la
plupart des défaites rapides. Lancez une partie et traquez activement le mat du
couloir : c'est celui que vous croiserez le plus.

<!-- faq -->
## Questions fréquentes

### Quel est l'échec et mat le plus rapide aux échecs ?
Le mat du lion, en deux coups : 1.f3 e5 2.g4 Dh4#. Il ne peut survenir que si les blancs poussent les pions f et g lors de leurs deux premiers coups, donc en pratique il n'arrive presque jamais.

### Comment se défendre du mat du berger ?
Le plus simple est de répondre 3...g6 pour attaquer la dame, et seulement ensuite de développer le cavalier en f6. 3...De7 défend aussi f7. Le coup perdant est 3...Cf6, car il laisse f7 défendue par le seul roi.

### Quelle différence entre échec et mat et pat ?
Dans l'échec et mat, votre roi est attaqué et vous n'avez aucun coup légal : vous perdez. Dans le pat, vous n'êtes pas en échec mais vous n'avez pas de coup légal non plus : la partie est nulle.

### Comment éviter le mat du couloir ?
Poussez votre pion tour (h3 en blancs, h6 en noirs) à un moment calme pour offrir une case de fuite à votre roi. Et avant d'échanger les tours, vérifiez que votre dernière rangée n'est pas laissée sans défense.

### Peut-on mater avec seulement un roi et un cavalier ?
Non. Roi et cavalier contre roi seul, c'est matériel insuffisant et la partie est nulle. Roi et fou ne suffit pas non plus. Le minimum pour forcer le mat, c'est roi et tour, roi et dame, ou deux fous.
