### FPM et messages de logs de PHP

Attention à ne pas confondre les nombreux "error\_log" :

* $${\color{#da7a9d}∗}$$ [fonction PHP](https://www.php.net/manual/en/function.error-log.php) : envoi un message d'erreur
* $${\color{#f8f881}∗}$$ [directive de configuration PHP](https://www.php.net/manual/en/errorfunc.configuration.php#ini.error-log) : où envoyer les messages de logs de PHP (exemple : « PHP Warning: Undefined array key "xxx" »). (rappel : le niveau de logs envoyés est réglable avec `error_reporting`)   
* $${\color{#bfebad}∗}$$ [directive globale de php-fpm.conf](https://www.php.net/manual/en/install.fpm.configuration.php#error-log) : où envoyer les messages internes de FPM (exemple : « NOTICE: ready to handle connections » ou « ERROR: FPM initialization failed »)  
* $${\color{#f6ac81}∗}$$ [directive nginx](https://nginx.org/r/error_log) ou [directive "ErrorLog" Apache2](https://httpd.apache.org/docs/current/mod/core.html#errorlog)

![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgP2_mghS2DZQ6xXT7xedeWcYBYPvzNAGIi4d7wnkeUTQG7pdHHsxnU6n6G3WhMxBCNFZ_JcP0totzIJXh2SvNBIrCU_jSV5_HaMR5kxXCC6CKZ5hOG4VVgMJLRaC-T_ghjZMqP4-nj9VQ/s1600/10-24-php-fpm-logging.png)

(from [https://www.decodednode.com/2014/10/php-fpm-error-logging-where-fastcgi.html](https://www.decodednode.com/2014/10/php-fpm-error-logging-where-fastcgi.html) )

*   par défaut, les "messages de logs de PHP" suivent le chemin en flèches rouge.
    
    *   ils sont transférés via le stream FCGI\_STDERR (avec préfixe "PHP message: ", cf `sapi_cgi_log_message()` dans le code source de PHP)
        
    *   et arrivent finalement sur une seule ligne dans le error.log apache2/nginx.
        
    *   Depuis PHP 8.2, il y a au moins un " ; " pour séparer les entrées (cf https://github.com/php/php-src/issues/10890 )
        
*   en configurant `php_admin_value[error_log]`, il est possible de modifier ce comportement (cf le texte en jaune sur le diagramme) :
    
    *   envoyer vers syslog (avec possibilité de paramétrer `syslog.ident`)
        
    *   envoyer vers un fichier (mais le format n'est pas du tout paramétrable (cf `php_log_err_with_severity` dans main/main.c dans le code source de PHP)
        
        *   dans un docker, il est possible d'envoyer vers le stderr du conteneur (`php_admin_value[error_log] = /proc/1/fd/2`, de façon similaire au `access.log = /proc/self/fd/2`, mais attention, on attaque directement le fd/2 du master FPM)
            

NB : `catch_workers_output` modifie le comportement de ce qui est envoyé explicitement sur stdout/stderr dans PHP. Ce n'est pas un cas courant, donc à ignorer (en vert clair et blanc sur le diagramme) !!
