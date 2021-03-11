Here is a minimal migration from debian host PHP-FPM to docker, with
* no networking complexity/mess: use host network. (when you do not want your container to use a new IP)
* manual handling of FPM listen ports is tedious, better keep using UNIX socket.
* keep using host mysql through UNIX socket: simply pass the socket to the container

Full example:

* /etc/docker/daemon.json [to disable bridge](https://stackoverflow.com/questions/52146056/how-to-delete-disable-docker0-bridge-on-docker-startup)
```json
{
    "iptables": false,
    "bridge": "none"
}
```

* Dockerfile
```Dockerfile 
FROM debian:stretch-slim
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y php-fpm php-ldap php-curl php-mbstring php-cas
COPY php-fpm.conf /etc/php/7.0/fpm/pool.d/www.conf
ENTRYPOINT ["php-fpm7.0"]
```

* php-fpm.conf ([ref](https://serverfault.com/questions/658367/how-to-get-php-fpm-to-log-to-stdout-stderr-when-running-in-a-docker-container))
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

* to deploy (with [container using host user](https://medium.com/faun/set-current-host-user-for-docker-container-4e521cef9ffc))

```sh
docker build --network=host -t foo .

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

* to update, run the following and deploy again
```sh
docker container rm wsgroups -f
```

* if one container relies on host mysql, you must ensure /var/run/mysqld is created before docker restart the containers on boot. With systemd, create /etc/systemd/system/docker.service.d/need-mysql.conf
```ini
[Unit]
# ensure /var/run/mysqld is created
After=mariadb.service
```

