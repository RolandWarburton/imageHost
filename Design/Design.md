# Design Document

## Overview

A self hosted image storage service. Scalability is not a primary concern, idealy storing a maximum of 10,000 images as to fit nicely within the cheapest storage tier of most VPS providers (10,000 images = 20G).

Based loosely on imgurs [tech stack](https://stackshare.io/imgur/imgur).

how scalable should the service be? mongo vs postgresql? mongo is option we are going with for this project because it is somewhat scalable and more importantly easier to use, also its based on json which is a plus.

![Frontend Design](./Assets/design.png)
<!-- ![logo](./Assets/logo.svg) -->

## Feature list

### Exports

#### Ability to export entire library as zip folder. Retaining tags inside

* Export the whole thing as a zip. Tags are included as well (either burnt into the image or in a seperate json file at export time)

#### Access to images is restricted

Access to images is restricted behind a key or passphrase.

Images are only accessable through the api.

Per routes that can return an array of images (ie. searches) a key or password is required.
The key needs to be submitted with a post or get request to deal with images on endpoints that return multiple results.

### API

Api is placed on a special subdomain (api.website.com or i.website.com for example).

#### GET

Getting image. Example: `https://www.i.website.com/YmlqZ46`

* GET image by name (image name is a hash)
* Get ALL images (requies key)
* get image by tag (reques key)

###### getting multiple images

on the browser side, you request an array of multiple image names. This is where the authentication token is required.

#### POST

The following arguments are supported in the POST arguments:

* **forceTags**: bool
* **tags**: Array of strings
* **img**: blob of img
* **key**: Security key

Post is 1 image at a time. POSTing multiple images can be made avalible using a frontend to submit consequtive POSTs.
The POST response is the URL.

##### Image

The following image formats will be supported:

* png
* jpg
* svg
* webm
* mp4 (different process?)
* gif  

##### Tags

you upload a photo with the tags:
`["holiday"]`. The server has the tags ["Holiday"]
The tags are checked on the server and corerced into existing tags, if no tags are found then a new one is generated
eg the uploaded tag `"holiday"` will be corrected into `"Holiday"`. If the tag was `"Person"`
eg the uploaded tag `"holidays"` will be corrected into `"Holiday"`.
eg the uploaded tag `"holiday's"` will be corrected into `"Holiday"`.

When posting, you can parse an option to force your tags to be uploaded without spell checking.

Example of post data:

```json
{
	"forceTags": true,
	"tags": ["holiday", "human", "abc"],
	"img": "blob",
}
```

#### DELETE

## UI/UX

## Implementation

### Storing images

Images will be stored on the filesystem, not in the database.

```javascript
{
	filename: "abcdef.png",
	fielLoc: "/upload/abcdef.png"
}
```

### Storing tags

Tags will be stored in the database, not the images.

```javascript
{
	filename: "abcdef.png",
	tags: ["a", "b", "c"]
}
```

script sets up mongo db. Runs commands to create mongo (mongo must already be installed)

When the script sets up mongodb, it also writes to a key.txt file with a suggested key to use.

The user then needs to either...

* change the key variable in the source code
* a frontend is configured to change the key for them on the provided frontend website

### Installer

#### Stuff which needs to be read by user

1. MongoDB Connection (default localhost?)
2. Database name (Default imageHost)
3. Primary storage location name (Named by user, defaults to upload)
4. Key (Customized password, default auto-generated)

#### Example Settings.json file

```javascript
{
	"defaultLocation": "/upload",
	"key" : "jhreiu943hjG$#J i4hj tr4iounrt4j3kior n",
	"databaseURL" : "localhost:27017/imageHost"
}
```

##### Example Database Collection

```javascript
	{
		filename: "hashman",
		loc: "/upload",
		tags: []
	},
	{
		filename: "hashman",
		loc: "/upload",
		tags: []
	}
}
```

## Junkyard

[https://stackoverflow.com/questions/34950658/how-to-read-png-meta-data-from-javascript](https://stackoverflow.com/questions/34950658/how-to-read-png-meta-data-from-javascript)
[https://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_PNG_files](https://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_PNG_files)
[https://www.npmjs.com/package/exif-parser](https://www.npmjs.com/package/exif-parser)
[https://www.npmjs.com/package/imagemagick](https://www.npmjs.com/package/imagemagick)
[https://techsparx.com/nodejs/howto/image-metadata.html](https://techsparx.com/nodejs/howto/image-metadata.html)
[https://www.npmjs.com/package/pngjs](https://www.npmjs.com/package/pngjs)
[https://www.npmjs.com/package/file-type](https://www.npmjs.com/package/file-type)
[https://www.npmjs.com/package/exif-parser](https://www.npmjs.com/package/exif-parser)
