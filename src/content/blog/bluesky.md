---
title: "BlueSky Ransomware Lab — Cyberdefenders"
description: "Análisis forense de un ataque ransomware: identificación del atacante, explotación vía MSSQL, ejecución remota, evasión de defensas y persistencia mediante tareas programadas."
pubDate: "2025-12-17"
tags: ["CyberDefenders", "Blue Team", "Network Forensics", "Ransomware", "Windows", "MSSQL"]
draft: false
---
**Dificultad:** Medium

## 🧾 Resumen Ejecutivo

Este análisis forense documenta un incidente de ransomware en un entorno Windows, identificando el acceso inicial mediante MSSQL, la ejecución remota de scripts PowerShell, mecanismos de persistencia y la atribución a la familia **BlueSky Ransomware** a partir de evidencia de red y eventos del sistema.

---

## 📌 Descripción del Escenario

La organización detecta actividad anómala en uno de sus servidores Windows.  
Se proporciona evidencia en forma de capturas de tráfico de red (PCAP) y logs del sistema con el objetivo de reconstruir la cadena de ataque e identificar las técnicas utilizadas por el atacante.

---

## 🔍 Análisis de Red — Reconocimiento

El análisis del tráfico revela actividad de escaneo dirigida desde una IP externa hacia el servidor comprometido.
![Evidencia](../../../public/soc%20evidences/BlueSky%20Ransomware%20Lab/evidencianmap.png)
**Evidencia:** Tráfico TCP mostrando enumeración activa del servicio MSSQL (1433).

- **IP atacante:** `87.96.21.84`
- Múltiples paquetes TCP con flags `SYN, ACK`
- Foco reiterado en el puerto **1433 (MSSQL)**

Esto indica un reconocimiento activo y dirigido sobre servicios expuestos.

**MITRE ATT&CK:**  
- TA0043 – Reconnaissance  
- T1046 – Network Service Scanning

---

## 🔐 Acceso Inicial — Compromiso de MSSQL
![Evidencia](../../../public/soc%20evidences/BlueSky%20Ransomware%20Lab/evidencialogin.png)
Se identifica tráfico correspondiente al protocolo **TDS7 Login**, utilizado por Microsoft SQL Server.

**Evidencia:** Autenticación MSSQL utilizando credenciales administrativas expuestas.

**Hallazgos clave:**
- Usuario autenticado: `sa`
- Base de datos: `master`
- Puerto: `1433/TCP`

Las credenciales administrativas fueron capturadas durante el análisis del tráfico, confirmando el compromiso directo del servicio MSSQL como vector de acceso inicial.  
El uso de credenciales válidas sugiere credenciales débiles, reutilizadas o previamente comprometidas.

**MITRE ATT&CK:**  
- TA0001 – Initial Access  
- T1078 – Valid Accounts

---

## 🧰 Ejecución Remota de Comandos
![Evidencia](../../../public/soc%20evidences/BlueSky%20Ransomware%20Lab/evidenciaremotecode.webp)
**Evidencia:** Uso de funcionalidades avanzadas de SQL Server para ejecutar comandos del sistema.

Una vez autenticado, el atacante habilita funcionalidades avanzadas del motor SQL para ejecutar comandos del sistema operativo, lo que permite:

- Ejecución de PowerShell
- Descarga de scripts remotos
- Preparación del entorno para persistencia

Esta técnica es común en escenarios de post-explotación sobre SQL Server.

**MITRE ATT&CK:**  
- TA0002 – Execution  
- T1059.001 – Command and Scripting Interpreter: PowerShell

---

## 📥 Descarga de Scripts Maliciosos
![Evidencia](../../../public/soc%20evidences/BlueSky%20Ransomware%20Lab/evidenciascripts.png)
**Evidencia:** Descarga de script PowerShell desde servidor HTTP controlado por el atacante.

Se observa tráfico HTTP con respuesta `200 OK` desde la IP atacante, utilizando un servidor **SimpleHTTPServer (Python)**.

Los scripts PowerShell descargados incluyen:
- Verificación de conectividad
- Manejo silencioso de errores
- Funciones orientadas a deshabilitar mecanismos de defensa

Este comportamiento confirma la fase de preparación y control del sistema comprometido.

**MITRE ATT&CK:**  
- TA0011 – Command and Control  
- T1105 – Ingress Tool Transfer

---

## 🛡️ Evasión de Defensas
![Evidencia](../../../public/soc%20evidences/BlueSky%20Ransomware%20Lab/evidenciabypass.webp)
**Evidencia:** Modificación del registro de Windows Defender mediante PowerShell.

El análisis del script PowerShell descargado revela la manipulación directa de claves
del registro asociadas a Windows Defender, incluyendo la desactivación del monitoreo
en tiempo real y de componentes antispyware.

Las claves modificadas incluyen DisableAntiSpyware y DisableRealtimeMonitoring,
lo que indica una intención explícita de deshabilitar los mecanismos de defensa
del sistema y evitar detección durante la ejecución del malware.

**MITRE ATT&CK:**
- TA0005 – Defense Evasion
- T1562.001 – Impair Defenses: Disable or Modify Tools
---

## 📌 Persistencia
![Evidencia](../../../public/soc%20evidences/BlueSky%20Ransomware%20Lab/evidenciapersistencia.webp)
**Evidencia:** Tarea programada utilizada para persistencia.

Para mantener el acceso al sistema, el atacante crea una tarea programada maliciosa:

```
\Microsoft\Windows\MUI\LPupdate
```

Esta tarea ejecuta scripts PowerShell de forma periódica, asegurando persistencia incluso tras reinicios del sistema.

**MITRE ATT&CK:**  
- TA0003 – Persistence  
- T1053.005 – Scheduled Task

---

## 🧬 Escalada de Privilegios
![Evidencia](../../../public/soc%20evidences/BlueSky%20Ransomware%20Lab/evidenicalogon.png)

**Evidencia:** Ejecución de PowerShell bajo winlogon.exe (contexto SYSTEM).

Los eventos de PowerShell (Event ID 400) muestran ejecución bajo el proceso:

- **HostApplication:** `winlogon.exe`

Esto indica ejecución en contexto **SYSTEM**, consistente con técnicas de post-explotación avanzadas y control total del host.

**MITRE ATT&CK:**  
- TA0004 – Privilege Escalation  
- T1547 – Boot or Logon Autostart Execution


---

## 🦠 Identificación de la Familia Ransomware

A partir del análisis de comportamiento, infraestructura utilizada y payload descargado, el ataque se atribuye a la familia:

**BlueSky Ransomware**

Esta familia se encuentra asociada a variantes tipo **Conti-like**, conocidas por el uso extensivo de PowerShell, desactivación de defensas y técnicas de post-explotación basadas en PowerShell.

---

## 🧠 Conclusión

Este laboratorio demuestra la importancia del monitoreo de tráfico de red, la protección de servicios críticos como MSSQL y la correlación entre eventos de red y logs del sistema para una respuesta efectiva ante incidentes de ransomware.

La correcta identificación de persistencia y de la familia de ransomware permite fortalecer controles defensivos y mejorar la preparación ante ataques futuros.

---

## 🗺️ MITRE ATT&CK — Resumen

| Táctica | Técnica |
|------|------|
| Reconnaissance | T1046 – Network Service Scanning |
| Initial Access | T1078 – Valid Accounts |
| Execution | T1059.001 – PowerShell |
| Persistence | T1053.005 – Scheduled Task |
| Defense Evasion | T1562.001 – Disable Security Tools |
| Privilege Escalation | T1547 – Boot or Logon Autostart Execution |
| Command & Control | T1105 – Ingress Tool Transfer |
