# Image Host Website

Roland - warburtonroland@gmail.com\
Jimuskin - james_boyd@jimusk.in

---

![Frontend Design](Design/Assets/design.png)

## Dotenv Configuration

Make sure to include a `.env` file on the root of the project containing.

```none
DB_CONNECTION=mongodb://username:password@127.0.0.1:27017/databaseName
MODE=development | production
DEVELOPMENT_UPLOAD_DIRECTORY_LOCATION=./uploads
PRODUCTION_UPLOAD_DIRECTORY_LOCATION=/uploads
```

If you are enforcing access control (all databases must have a password) you need to specify the authentication database when connecting to mongodb_compass.

Use a url that looks like. In most cases the auth db name is the same as the db you are connecting to.

```none
mongodb://username:password@127.0.0.1:27017/databaseName?authSource=authenticationDbName
```

## Installation

1. Database must be called "imageHost"
