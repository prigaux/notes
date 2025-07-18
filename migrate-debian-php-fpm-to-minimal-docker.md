Here is a minimal migration from debian host PHP-FPM to docker, with
* no networking complexity/mess: use host network. (when you do not want your container to use a new IP)
* manual handling of FPM listen ports is tedious, better keep using UNIX socket.
* keep using host mysql through UNIX socket: simply pass the socket to the container

Full example:

### Dockerfile

```Dockerfile 
FROM debian:stretch-slim
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y php-fpm php-ldap php-curl php-mbstring php-cas
COPY php-fpm.conf /etc/php/7.0/fpm/pool.d/www.conf
ENTRYPOINT ["php-fpm7.0"]
```

### php-fpm.conf

([ref](https://serverfault.com/questions/658367/how-to-get-php-fpm-to-log-to-stdout-stderr-when-running-in-a-docker-container))
 
```ini
[global]
error_log = /proc/self/fd/2
daemonize = no

[www]
; if we send this to /proc/self/fd/1, it never appears
access.log = /proc/self/fd/2
listen = /run/php/fpm.sock

pm = dynamic
pm.max_children = 50
pm.start_servers = 1
pm.min_spare_servers = 1
pm.max_spare_servers = 3
```

### to deploy

(with [container using host user](https://medium.com/faun/set-current-host-user-for-docker-container-4e521cef9ffc))

```sh
docker build --pull -t foo .

# ensure directories exist
install -d -o fpm /webhome/foo/.run /var/lib/php/sessions-foo

docker run -d --restart unless-stopped \
  --network host \
  --user `id -u fpm`:`id -g foo` \
  --volume="/etc/group:/etc/group:ro" \
  --volume="/etc/passwd:/etc/passwd:ro" \
  --volume="/etc/shadow:/etc/shadow:ro" \
  --volume="/var/run/mysqld:/var/run/mysqld" \  
  --volume="/webhome/foo/www:/webhome/foo/www" \
  --volume="/webhome/foo/.run:/run/php" \
  --volume="/var/lib/php/sessions-foo:/var/lib/php/sessions" \
  --name foo foo
```

### to update

run the following and deploy again
```sh
docker container rm wsgroups -f
```

### on boot

if one container relies on host mysql, you must ensure /var/run/mysqld is created before docker restart the containers on boot. With systemd, create /etc/systemd/system/docker.service.d/need-mysql.conf
```ini
[Unit]
# ensure /var/run/mysqld is created
After=mariadb.service
```

### crons

crons and docker is not easy. 

#### debian uses a cron for php sessionclean

either create `/etc/cron.d/dockers-php-sessionclean` with
```
09,39 *     * * *     root   find -O3 /var/lib/php/sessions* -ignore_readdir_race -depth -mindepth 1 -name 'sess_*' -type f -cmin +24 -delete
```

or create `/etc/php/7.0/fpm/conf.d/docker-reenable-sessions-gc.ini` with
```ini
[Sessions]
session.gc_probability = 1
```
#### host cron using docker exec or docker run

replace 
```
5 * * * * /usr/bin/php ...
```
with
```
5 * * * * /usr/bin/docker exec foo php ...
```
(where "foo" is the name of the container running PHP-FPM)
or with
```
5 * * * * /usr/bin/docker run --volume ... --rm --entrypoint=php up1-stats ...
```
(where "foo" is the name of the image containing PHP-FPM & PHP-cli)

NB: it needs to be run as root


### mails

PHP often rely on PHP [mail](https://php.net/manual/en/function.mail.php) or sendmail binary.

Postfix is no good inside a container (it relies on a daemon, setuid binary...)

A simple solution is to use [msmtp](https://marlam.de/msmtp/) which sends mails to a SMTP server (for example the host postfix configured with `inet_interfaces = 127.0.0.1` and `smtpd_relay_restrictions = permit_mynetworks, reject`)

install [`msmtp-mta`](https://packages.debian.org/stable/msmtp-mta)
in the image, add `/etc/msmtprc` with:
```
defaults
account default
host localhost
from no-reply@foo.com
```
