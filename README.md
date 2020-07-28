# Image Host Website

[![forthebadge](https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg)](https://forthebadge.com)

Roland - warburtonroland@gmail.com\
Jimuskin - james_boyd@jimusk.in

---

![Frontend Design](Design/Assets/design.png)

## Dotenv Configuration

Make sure to include a `.env` file on the root of the project containing.

```none
# Connection to your production database
DB_USERNAME=roland
DB_PASSWORD=rhinos
DB_PORT=27017
DB_DATABASE=imageHost
DB_AUTHENTICATION_DATABASE=imageHost

# Connection to your testing database. Only needed for testing
DB_CONNECTION_TESTING=mongodb://username:password@localhost:27017/testing?authSource=testing

# SuperUser account for setting up
ACCOUNT_MASTER_USERNAME=AccountMaster
ACCOUNT_MASTER_PASSWORD=password

# Nodes env
NODE_ENV=development

# Used to encrypt/decrypt JWT
USER_KEY=123456

# Where to put uploaded media
UPLOAD_DIRECTORY_LOCATION=./uploads

# The port to run on
PORT=2020

# Where is your project located
ROOT=/home/meMyself/imageHost

#Domain name
DOMAIN=0x8.host

# Allow fallback to a req.header.auth-token. Otherwise a cookie from /login is required
# Change to true if you are using clients like sharex to post images from
ALLOW_HEADER_TOKEN=true

```

### Running locally with authentication

If you are enforcing access control (all databases must have a password) you need to specify the authentication database when connecting to mongodb_compass.

Use a url that looks like. In most cases the auth db name is the same as the db you are connecting to.

```none
mongodb://username:password@127.0.0.1:27017/databaseName?authSource=authenticationDbName
```

### Running in a docker container

Change the @127... to @mongo which is the name of the mongo database container. This should be done automatically.

### Running locally

You may need to change the authentication database to **?authSource=admin** if your authentication database is not Imagehost, or better yet use the script inside *init-mongo.js* to create your user in the same way that it would be created on the docker container.

```none
DB_CONNECTION=mongodb://roland:rhinos@mongo:27017/imageHost?authSource=imageHost
```

## Installation

1. Database must be called "imageHost"

## References

Getting a user and database created on the docker container [here](https://medium.com/faun/managing-mongodb-on-docker-with-docker-compose-26bf8a0bbae3).
