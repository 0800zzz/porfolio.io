---
title: "Breakme"
description: "Write-up Breakme , MED MACHINE"
pubDate: "Jul 15 2022"
heroImage: "/image.jpg"
---

<!-- ************************** -->
<!-- SECCIÓN DE INTRODUCCIÓN -->
<!-- ************************** -->

![Banner de la máquina](/assets/london-bridge-cover.webp)

Esta máquina **Linux (dificultad media)** explota:

- Local File Inclusion (LFI)
- Exposición de claves SSH
- Escalada vía misconfiguración SUDO

---

<!-- ************************** -->
<!-- SECCIÓN DE RECONOCIMIENTO -->
<!-- ************************** -->

## 🔍 1. Reconocimiento Inicial

### Escaneo Nmap
```bash
nmap -sV -sC -p- 10.10.154.180 -oN scans/nmap_initial
```

**Enumeracion de dominios**:
```bash
 feroxbuster -u 'http://breakme.thm' -w /usr/share/wordlists/dirb/big.txt
```
**Enumeracion de usuarios**:
```bash
wpscan --url 10.10.199.6/wordpress --enumerate u

```
resultados : admin &
bob.

### Enumeracion de usuarios:
```bash
wpscan --url http://breakme.thm/wordpress/ -U admin,bob -P /usr/share/wordlists/rockyou.txt

```
### Login como admin
```bash
wpscan --url http://breakme.thm/wordpress/ -U admin,bob -P /usr/share/wordlists/rockyou.txt

```
### Subida de reverse shell

```bash
wpscan --url http://breakme.thm/wordpress/ -U admin,bob -P /usr/share/wordlists/rockyou.txt

```


```bash
wpscan --url http://breakme.thm/wordpress/ -U admin,bob -P /usr/share/wordlists/rockyou.txt

```

## 3. Post-Explotación
```bash
wpscan --url http://breakme.thm/wordpress/ -U admin,bob -P /usr/share/wordlists/rockyou.txt

```

## 3. Escala de Privilegios
```bash
wpscan --url http://breakme.thm/wordpress/ -U admin,bob -P /usr/share/wordlists/rockyou.txt

```a