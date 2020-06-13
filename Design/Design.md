# Design Document

## Overview

A self hosted image storage service. Scalability is not a primary concern, idealy storing a maximum of 10,000 images as to fit nicely within the cheapest storage tier of most VPS providers (10,000 images = 20G).

Based loosely on imgurs [tech stack](https://stackshare.io/imgur/imgur).

how scalable should the service be? mongo vs postgresql? mongo is option we are going with for this project because it is somewhat scalable and more importantly easier to use, also its based on json which is a plus.

![Frontend Design](./Assets/design.png)
<!-- ![logo](./Assets/logo.svg) -->

## Feature list

### Exports

Ability to export entire library as zip folder. Retaining tags inside.

* Export the whole thing as a zip. Tags are included as well (either burnt into the image or in a seperate json file at export time)

### API

Api is placed on a special subdomain (api.website.com or i.website.com for example).

#### GET

Getting image. Example: `https://www.i.website.com/YmlqZ46`

#### POST

The following arguments are supported in the POST arguments:

* **forceTags**: bool
* **tags**: Array of strings
* **img**: blob of img

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

#### PUT

#### DELETE

## UI/UX

## Implementation

[https://stackoverflow.com/questions/34950658/how-to-read-png-meta-data-from-javascript](https://stackoverflow.com/questions/34950658/how-to-read-png-meta-data-from-javascript)
[https://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_PNG_files](https://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_PNG_files)
[https://www.npmjs.com/package/exif-parser](https://www.npmjs.com/package/exif-parser)
[https://www.npmjs.com/package/imagemagick](https://www.npmjs.com/package/imagemagick)
[https://techsparx.com/nodejs/howto/image-metadata.html](https://techsparx.com/nodejs/howto/image-metadata.html)
[https://www.npmjs.com/package/pngjs](https://www.npmjs.com/package/pngjs)
[https://www.npmjs.com/package/file-type](https://www.npmjs.com/package/file-type)
[https://www.npmjs.com/package/exif-parser](https://www.npmjs.com/package/exif-parser)
