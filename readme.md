# Dashboard

![Guest landing page](https://userdashboard.github.io/outline.png?raw=true) 

Dashboard is a parallel web application that accompanies your web app, subscription service, or Stripe Connect platform to provide all the "boilerplate" a modern web app requires to serve its users.  Use Dashboard instead of rewriting user account and login systems.

## Development status

Dashboard is ready to use.  The following work remains and help is welcome:

- translations required for everything in /languages please help
- add sorting and searching table data to the APIs and UIs
- add signin throttling
- add api throttling
- add UI for setting user language preference
- add server handler to substitute preferred language HTML
- add hooks for 2FA 
- needs module for API keys
- needs module for logs

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

#### License

This software is distributed under the MIT license.
