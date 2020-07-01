# Image Host Website

Roland - warburtonroland@gmail.com\
Jimuskin - james_boyd@jimusk.in

---

![Frontend Design](Design/Assets/design.png)

## Dotenv Configuration

Make sure to include a `.env` file on the root of the project containing.

```none
DB_CONNECTION=mongodb://username:password@127.0.0.1:27017/databaseName
NODE_ENV=development
USER_KEY=123456
UPLOAD_DIRECTORY_LOCATION=./uploads
```

### Running locally with authentication

If you are enforcing access control (all databases must have a password) you need to specify the authentication database when connecting to mongodb_compass.

Use a url that looks like. In most cases the auth db name is the same as the db you are connecting to.

```none
mongodb://username:password@127.0.0.1:27017/databaseName?authSource=authenticationDbName
```

### Running in a docker container

Change the @127... to @mongo which is the name of the mongo database container.

```none
DB_CONNECTION=mongodb://roland:rhinos@mongo:27017/imageHost?authSource=imageHost
```

### Running locally

You may need to change the authentication database to **?authSource=admin** if your authentication database is not Imagehost, or better yet use the script inside *init-mongo.js* to create your user in the same way that it would be created on the docker container.

```none
DB_CONNECTION=mongodb://roland:rhinos@mongo:27017/imageHost?authSource=imageHost
```

## Installation

1. Database must be called "imageHost"

## References

Getting a user and database created on the docker container [here](https://medium.com/faun/managing-mongodb-on-docker-with-docker-compose-26bf8a0bbae3).
