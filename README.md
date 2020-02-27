# Foosball facial recognition

I've split this into folders, each is a test/demo of some tech we could use for this.

##Setup on Windows 10
HTTPS dev server needed for video cam access. To install:

`npm install http-server -g`

You need to generate certificates in the appropriate directly:

`openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
`

##Running on Windows 10
To run compiler (from appropriate directory):

`gulp`

Then run the dev server:

`http-server -S -C cert.pem`