# upload.

A tiny clientside uploader for s3 presigned URLs.

Built with Svelte 5 and compiled into a single small html file.

## Setup

You'll need a bucket for the uploaded files, with CORS enabled.

```sh
$ aws s3api put-bucket-cors --bucket uploads --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT"],
      "AllowedOrigins": ["*"]
    }]
  }'
```

If you want to deploy your own copy of the site, deploy
[it](https://nightly.link/tombl/upload./workflows/build/main/site.zip) to your
static host of choice (S3?), substituting `PREFIX = "https://YOUR_S3_BUCKET/"`
at the top of `index.html` with your S3 bucket's domain.

Obtain an S3 presigned PUT URL via your favorite method. If you don't have a
favorite method, this repo contains a go program that can sign URLs for you.

```sh
$ git clone https://github.com/tombl/upload. upload
$ cd upload
$ go build ./sign.go
$ # takes creds from the aws cli
$ ./sign -bucket uploads -object example.txt
https://s3.invalid/example.txt?X-Amz-...
```

## Usage

Navigate to
<https://upload.on.tombl.net/#https://s3.invalid/example.txt?X-Amz-...>,
substituting your presigned URL and optionally your static hosted deployment.

The URL will be compressed via
[a custom compression scheme](https://github.com/tombl/upload./blob/main/src/qpack.ts)
to ~2x shorter.

Copy the new shortened URL from the address bar and send it to your recipient,
who can upload one or more files. If they upload multiple files, they'll be
automatically zipped together.

## Potential improvements

This is a tiny tool right now, built to meet very slim requirements. Here's a
handful of polish/feature ideas:

- A second page to sign URLs in the browser
- An upload speed graph
- Multipart uploads
  - Faster and resumable
  - Likely requires a backend
- Text animations inspired by SwiftUI's
  `.contentTransition(.numericText(value:))`
