# Dashboard
![StandardJS](https://github.com/userdashboard/dashboard/workflows/standardjs/badge.svg) 

![Mocha tests with local disk](https://github.com/userdashboard/dashboard/workflows/mocha-disk/badge.svg) ![Mocha tests with Redis](https://github.com/userdashboard/dashboard/workflows/mocha-redis/badge.svg) ![Mocha tests with PostgreSQL](https://github.com/userdashboard/dashboard/workflows/mocha-postgresql/badge.svg) ![Mocha tests with S3](https://github.com/userdashboard/dashboard/workflows/mocha-s3/badge.svg)  

![Nocha tests with encrypted local disk](https://github.com/userdashboard/dashboard/workflows/mocha-encrypted-fs/badge.svg) ![Mocha tests with encrypted Redis](https://github.com/userdashboard/dashboard/workflows/mocha-encrypted-redis/badge.svg) ![Mocha tests with encrypted PostgreSQL](https://github.com/userdashboard/dashboard/workflows/mocha-encrypted-postgresql/badge.svg) ![Mocha tests with encrypted S3](https://github.com/userdashboard/dashboard/workflows/mocha-encrypted-s3/badge.svg)  

![Guest landing page](https://userdashboard.github.io/outline.png?raw=true) 

Dashboard is a parallel web application that accompanies your web app, subscription service, or Stripe Connect platform to provide all the "boilerplate" a modern web app requires to serve its users.  Use Dashboard instead of rewriting user account and login systems.

## Development status

Check the [Github Issues](https://github.com/userdashboard/dashboard/issues) for ways you can help improve and continue development of this module, including:

- translations
- adding support for new functionality
- creating modules with new functionality

## Local documentation

| File | Description | 
|------|-------------|
| `/documentation/1. What is Dashboard.md` | Markdown version of the developer documentation |
| `/documentation/2. Building an application with Dashboard.md` | Markdown version of the developer documentation |
| `/api.txt` | How to use the API via NodeJS or your application server |
| `/sitemap.txt` | Runtime configuration and map of URLs to modules & local files |
| `/start-dev.sh` | Environment variables you can use to configure Dashboard |

## Online documentation

Join the freenode IRC #dashboard chatroom for support.  [Web IRC client](https://kiwiirc.com/nextclient/)

- [Developer documentation home](https://userdashboard.github.io/home)
- [Administrator manual](https://userdashboard.github.io/administrators/home)
- [User manual](https://userdashboard.github.io/users/home)

### Case studies 

`Hastebin` is an open source pastebin web application.  It started as a service for anonymous guests only, and was transformed with Dashboard and modules into a web application for registered users with support for sharing posts with organizations and paid subscriptions.

- [Hastebin - free web application](https://userdashboard.github.io/integrations/converting-hastebin-free-saas.html)
- [Hastebin - subscription web application](https://userdashboard.github.io/integrations/converting-hastebin-subscription-saas.html)

## Privacy

Dashboard accounts optionally support anonymous registration and irreversibly encrypt signin username and passwords.  There are no third-party trackers, analytics or resources embedded in Dashboard pages.  

#### Development

Development takes place on [Github](https://github.com/userdashboard/dashboard) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/dashboard).

To run the tests on linux you may need to install [dependencies for Chrome](https://stackoverflow.com/questions/59112956/cant-use-puppeteer-error-failed-to-launch-chrome):

sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

#### License

This software is distributed under the MIT license.
