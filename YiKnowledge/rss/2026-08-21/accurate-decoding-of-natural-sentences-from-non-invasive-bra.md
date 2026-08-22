---
title: Accurate Decoding of Natural Sentences from Non-Invasive Brain Recordings
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18114
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Mingfang Zhang, Jarod L\'evy, Cedric Rommel, J\'er\'emy Rapin, Corentin Bel,
  Julie Bonnaire, Daniel Nieto, Pierre Bourdillon, Svetlana Pinet, St\'ephane d'Ascoli,
  Thomas Moreau, Jean-R\'emi King
---

arXiv:2608.18114v1 Announce Type: cross 
Abstract: Restoring communication for people who have lost the ability to speak or move after a brain injury is a major challenge. While intracranial implants now enable high-performing brain-computer-interfaces, non-invasive alternatives are still lagging behind. Here, we present Brain2Qwerty v2, a model that can decode the production of natural sentences solely from real-time magnetoencephalography (MEG) recordings. By collecting 22,000 sentences typed by nine subjects, each recorded for 10 hours, our model leverages character, word and sentence-level representations to achieve an average word error rate (WER) of 39%. For our best participant, the model accurately decodes half of the sentences with one word error or less. Critically, decoding accuracy log-linearly improves with data volume, suggesting that the performance gap with intracranial approaches could be partially bridged through data scaling. We show that AI enables this performance in three main ways: the substitution of hand-crafted pipelines for event detection with deep learning, the finetuning of large language models to extract semantic representations, and the deployment of AI agents to iteratively refine our decoding pipeline via automated code development. Together, these results show that non-invasive brain-to-text decoding starts to operate at a level of accuracy previously thought exclusive to surgical implants, opening a path toward safe and efficient brain-computer-interfaces.