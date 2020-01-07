# Dashboard
![StandardJS](https://github.com/userdashboard/dashboard/workflows/standardjs/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-user-ui/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-administrator-ui/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-user-api/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-administrator-api/badge.svg)

When you want to write a web app you have to create authentication and account management and lots of other stuff each time.  Dashboard bundles all of this repeatative boilerplate into a parallel web server so your web app has fewer responsibilities.

After you set up a copy of Dashboard server you have a complete user and administrator interface with all the basic user functionality like registering and changing passwords provided by Dashboard.

Then you write your application server using your preferred language and have it serve your guest landing page on `/` and your application on `/home`, and any other URLs your application needs.

Users browse your dashboard server's address and it may serve its own content or proxy your application server.  Dashboard tells your server who the user is and you can access more information through APIs.  Your content can occupy the entire page or be served within a generic template with header, navigation bar and content sections.  You can make your own template too and serve CSS to style Dashboard's content.

Dashboard is written in NodeJS and supports local file system, Redis, PostgreSQL and S3 for data storage.  Dashboard modules are distributed using NPM and their `src/www` folders get merged to add UI and API routes.  There is test coverage for all UI and API routes and all UI pages are documented with screenshots at multiple resolutions.

The Organizations module adds a complete invitation-based membership system for your users.  The Stripe Connect module adds a complete custom integration ready for your users to receive payouts.  The Stripe Subscriptions module adds everything you need to start a Subscription SaaS.

## Support and contributions

If you have encountered a problem post an issue on the appropriate [Github repository](https://github.com/userdashboard).  

If you would like to contribute check [Github Issues](https://github.com/userdashboard/dashboard) for ways you can help. 

For help using or contributing to this software join the freenode IRC `#dashboard` chatroom - [Web IRC client](https://kiwiirc.com/nextclient/).

## Documentation

Dashboard and modules have setup and usage documentation contained in `readme.md` files.  This is the Dashboard readme.md.

Dashboard has run-time documentation generated when the server starts:

- `api.txt` provides a local copy of usage information for all of your API endpoints

- `sitemap.txt` contains your configuration, all URLs and where they have come from

The `readme.md` files are published in the online documentation too.  Online [API documentation](https://userdashboard.github.io/dashboard-api) has more information than the `api.txt` files.  The UI documentation for [users](https://userdashboard.github.io/account) and [administrators](https://userdashboard.github.io/administrators) demonstrates how to browse to or use each page.

# Write your application server

Your application server needs to serve a guest landing page on `/` and a `/home` page for your users, and any other URLs you want.  When your server is ready you can open your Dashboard server at `http://localhost:8000`.  The Dashboard server will communicate with your application server whenever the user requests a URL it doesn't recognize.  The first account to register is the website owner with the unique authority to assign and revoke administrators.  To allow guest access and use the entire page your `/` page should specify `<html auth="false" template="false">`.

Content is served in an `iframe` within the `template.html` unless you set `template="false"` in your `<html>` tag.  Everything outside of `/public` is considered private unless you set `auth="false"` in your `<html>` tag.

## Style the Dashboard content like your application

Your application server can serve two special CSS files, `/public/template-additional.css` and `/public/content-additional.css` to theme the Dashboard server template and content.  If you do not provide these files your Dashboard server will respond with blank files rather than 404 errors.  

The content you serve can include a `<template id="head"></template>` with HTML you wish to be copied into the template's `<HEAD>` tag.  Provide a `<template id="navbar"></template>` with HTML links if you want to borrow the template's navigation bar.

## Accessing Dashboard and module APIs from your application server

Dashboard and official modules are completely API-driven and you can access the same APIs on behalf of the user making requests.  You perform `GET`, `POST`, `PATCH`, and `DELETE` HTTP requests against the API endpoints to fetch or modify data.  This example uses NodeJS to fetch the user's account from the Dashboard server.

    const account = await proxy(`/api/user/account?accountid=${accountid}`, accountid, sessionid)

    const proxy = util.promisify((path, accountid, sessionid, callback) => {
        let hashText
        if (accountid) {
            hashText = `${process.env.APPLICATION_SERVER_TOKEN}/${accountid}/${sessionid}`
        } else {
            hashText = process.env.APPLICATION_SERVER_TOKEN
        }
        const salt = bcrypt.genSaltSync(4)
        const token = bcrypt.hashSync(hashText, salt)
        const requestOptions = {
            host: 'dashboard.example.com',
            path: path,
            port: '443',
            method: 'GET',
            headers: {
                'x-application-server': 'application.example.com',
                'x-dashboard-token': token
            }
        }
        if (accountid) {
            requestOptions.headers['x-accountid'] = accountid
            requestOptions.headers['x-sessionid'] = sessionid
        }
        const proxyRequest = require('https').request(requestOptions, (proxyResponse) => {
            let body = ''
            proxyResponse.on('data', (chunk) => {
                body += chunk
            })
            return proxyResponse.on('end', () => {
                return callback(null, JSON.parse(body))
            })
        })
        proxyRequest.on('error', (error) => {
            return callback(error)
        })
        return proxyRequest.end()
      })
    }

# Set up a copy of Dashboard

Dashboard is self-hosted and open source, you need to deploy it to eg Heroku or Digital Ocean or AWS before you can use it.  Dashboard is a NodeJS project requiring node `12.13.1`.

    $ mkdir dashboard-server
    $ cd dashboard-server
    $ npm init
    $ npm install @userdashboard/dashboard
    # install any modules you want here
    $ echo "require('@userdashboard/dashboard').start(__dirname)" > main.js

## Which storage backend?

Dashboard by default uses local disk, this is good for development and okay for applications that aren't going to grow to many users.  Alternatively you can use Redis, PostgreSQL or S3-compatible backends.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| Redis | Very fast but expensive to scale | [@userdashboard/storage-redis](https://npmjs.com/package/@userdashboard/storage-redis) | [github](https://github.com/userdashboard/storage-edis) |
| Amazon S3 | Slow but cheap to scale | [@userdashboard/storage-s3](https://npmjs.com/package/@userdashboard/storage-s3) | [github](https://github.com/userdashboard/storage-s3) |
| PostgreSQL | Fast but not cheap to scale | [@userdashboard/storage-postgresql](https://npmjs.com/package/@userdashboard/storage-postgresql) | [github](https://github.com/userdashboard/storage-postgresql) |

## Which modules?

Modules add new pages and API routes for additional functionality.  Modules are NodeJS packages that you install with NPM:

    $ npm install @userdashboard/stripe-subscriptions

You need to notify Dashboard which modules you are using in `package.json` conffiguration:

    "dashboard": {
      "modules": [
        "@userdashboard/stripe-subscriptions"
      ]
    }

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| MaxMind GeoIP | IP address-based geolocation | [@userdashboard/maxmind-geoip](https://npmjs.com/package/userdashboard/maxmind-geoip)| [github](https://github.com/userdashboard/maxmind-geoip) |
| Organizations | User created groups | [@userdashboard/organizations](https://npmjs.com/package/userdashboard/organizations) | [github](https://github.com/userdashboard/organizations) |
| Stripe Subscriptions | SaaS functionality | [@userdashboard/stripe-subscriptions](https://npmjs.com/package/userdashboard/stripe-subscriptions) | [github](https://github.com/userdashboard/stripe-subscriptions) |
| Stripe Connect | Marketplace functionality | [@userdashboard/stripe-connect](https://npmjs.com/package/userdashboard/stripe-connect) | [github](https://github.com/userdashboard/stripe-connect)

If you have built your own modules you may submit a pull request to add them to this list.  

## What user registration information

Dashboard supports optionally collecting a variety of profile information at registration.  This requires setting two environment variables:

       REQUIRE_PROFILE=true
       USER_PROFILE_FIELDS="any,of,the,below"

Otherwise users may register with just a username and password, both of which are encrypted so they cannot be used for anything but signing in.

|Field|
|----------
|full-name|
|contact-email|
|display-name|
|display-email|
|dob|
|location|
|phone|
|company-name|
|website|
|occupation|

# Publishing your Dashboard server

Dashboard is a stateless NodeJS server, you can publish it to Heroku or similar PaaS or put it on virtual machines through web hosts like Digital Ocean and Vultr.

## Securing communication between your Dashboard and application server

When you have published your server the communication between it and your application should take place over HTTPS and you should verify the requests.  When Dashboard proxies your application server it includes header information about the user:

    x-accountid
    x-sessionid
    x-dashboard-server
    x-dashboard-token
    
The `x-dashboard-token` is a bcrypt hash derived from user information and a secret shared between your dashboard and application servers.  This is a NodeJS example of validating the request:

    function compareDashboardHash(req, callback) {
        if (!req.headers['x-dashboard-server']) {
            return callback(null, req)
        }
        if (req.headers['x-dashboard-server'] !== process.env.DASHBOARD_SERVER) {
            return callback(null, req)
        }
        let expected
        if (!req.headers['x-accountid']) {
            expected = process.env.APPLICATION_SERVER_TOKEN
        } else {
            expected = `${process.env.APPLICATION_SERVER_TOKEN}/${req.headers['x-accountid']}/${req.headers['x-sessionid']}`
        }
        const sha = crypto.createHash('sha256')
        const expectedHash = sha.update(expected).digest('hex')
        return bcrypt.compare(expectedHash, req.headers['x-dashboard-token'], (error, match) => {
            if (match) {
                req.verified = true
            }
            return callback(null, req)
        })
    }

# Creating modules for Dashboard

Dashboard modules can provide additional APIs and content integrated with Dashboard when it scans the `/src/www` to create the sitemap.  A module is a NodeJS application too.

## Setting up a module project

    $ mkdir my-module
    $ cd my-module
    $ npm install @userdashboard/dashboard
    # create main.js to start the server
    # create index.js optionally exporting any relevant API
    # add your content or API endpoints or whatever your module is
    $ npm publish

If you're adding to the APIs or the UIs these paths have special significance:

| Folder | Description |
|-------|--------------|
| `/src/www` | Web server root |
| `/src/www/public` | Static assets served quickly |
| `/src/www/account` | User account management pages |
| `/src/www/account/YOUR_MODULE/` | Your additions (if applicable) |
| `/src/www/administrator` | Administration pages |
| `/src/www/administrator/YOUR_MODULE/` | Your additions (if applicable) |
| `/src/www/api/user` | User account management pages |
| `/src/www/api/user/YOUR_MODULE/` | Your additions (if applicable) |
| `/src/www/api/administrator` | Administration APIs |
| `/src/www/api/administrator/YOUR_MODULE/` | Your additions (if applicable) |

## Adding HTML content

Dashboard renders page content on the server-side using a DOM-like-interface and JSON-representation of the HTML.  HTML files will be served as static HTML if they are not accompanied by a NodeJS handler.  

Content pages may export `before`, `get` and `post` methods for Dashboard's server.  NodeJS files can also determine if a page is wrapped in the template or requires authorization per `<html template="false" auth="false" />`.

    {
      auth: false, // allow guest access to this page
      template: false, // occupy the full screen
      before: (req),
      get: (req, res),
      post: (req, res)
    }

## Adding API endpoints

Endpoints export methods for HTTP requests and do not serve responses as the API is dually-available to NodeJS and HTTP.  It returns objects for use with NodeJS and converts those to JSON-responses if accessing via HTTP.  API routes can be exposed for guests. 
  
    {
      auth: false, // allow guest access to this endpoint
      before: (req),
      delete: (req),
      get: (req),
      patch: (req),
      post: (req),
      put: (req)
    }
