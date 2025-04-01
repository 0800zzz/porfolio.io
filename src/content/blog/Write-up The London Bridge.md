---
title: "TryHackMe:  Walkthrough"
pubDate: 2025-03-28
description: "De LFI a root mediante exposición de claves SSH"
coverImage: "/assets/thm-london-bridge.webp"
tags: ["tryhackme", "lfi", "privilege-escalation"]
---

## Reconocimiento Inicial
### Escaneo Nmap
```bash
nmap -sV -sC -p- 10.10.154.180 -oN scans/nmap_initial