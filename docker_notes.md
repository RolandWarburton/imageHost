# Docker notes

## General instruction

>Pull the mongo docker image from docker hub

```none
docker pull mongo
```

> start a container in detached (-d) mode to run it like a daemon

```none
docker run -d mongo
```

> to reattach to the daemonised container run

```none
docker attach c18c99
```

> you might need to attach or run to a docker image in interactive (i) mode and to connect the stdout of the docker image to your own terminal (-t)

```none
docker run -it mongo
```

## Running docker files

> Build the docker image

```none

```

> Bring the docker image up. Use the -d flag to daemonise it

```none
sudo docker-compose up
```

> bring the docker image down

```none
sudo docker-compose down
```

> Get the ip of a docker container

```none
docker inspect docker-node-mongo | grep IPAdd
```

> Use a url to authenticate that looks like this

mongodb://roland:rhinos@mongo:27017/imageHost?authSource=admin
