# Dashboard
![StandardJS](https://github.com/userdashboard/dashboard/workflows/standardjs/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-user-ui/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-administrator-ui/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-user-api/badge.svg) ![Test suite](https://github.com/userdashboard/dashboard/workflows/test-administrator-api/badge.svg)

Dashboard provides the user boilerplate web apps require for users to register, create groups, subscription billing with Stripe etc.

You write your application in your preferred language and it serves your guest landing page on `/` and your web app on `/home`, and any other URLs your application needs.

Users browse your dashboard server's address and it may serve its own content or proxy your application server depending on what page the user's requesting.  Your server is told who the user is and can access more information through APIs.

You can style Dashboard content to look like your application, configure registration information, add modules for organizations and subscriptions and more.

Dashboard is written in NodeJS and supports local file system, Redis, PostgreSQL and S3 for data storage.

# Style Dashboard content like your application

Your application server can serve two special CSS files, `/public/template-additional.css` and `/public/content-additional.css` to theme the Dashboard server template and content.  If your server does not provide these files your Dashboard server will respond with blank files rather than 404 errors.

The content you serve can include a `<template id="head"></template>` with HTML you wish to be copied into the template's `<HEAD>` tag.  Provide a `<template id="navbar"></template>` with HTML links if you want to borrow the template's navigation bar.

# Access user data from your application

You can access the Dashboard APIs on behalf of the user making requests.  You perform HTTP requests against the API endpoints to fetch or modify data.  This example uses NodeJS to fetch the user's account from the Dashboard server.

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

Dashboard is a NodeJS project requiring node `12.13.1`.  You must install NodeJS first.

    $ mkdir dashboard-server
    $ cd dashboard-server
    $ npm init
    $ npm install @userdashboard/dashboard
    # install any modules you want here
    $ echo "require('@userdashboard/dashboard').start(__dirname)" > main.js

Dashboard is a stateless NodeJS server, you can publish it to Heroku or similar PaaS and scale to multiple instances, or use web hosts like Digital Ocean, Vultr, AWS etc and load balancing services they provide.  In production you should have at least 2 instances of the server sharing requests for basic redundancy.

# Dashboard storage backends

Dashboard by default uses local disk, this is good for development and okay for applications that aren't going to grow to many users.  Alternatively you can use Redis, PostgreSQL or S3-compatible backends.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| Redis | Maximum speed and maximum scaling cost | [@userdashboard/storage-redis](https://npmjs.com/package/@userdashboard/storage-redis) | [github](https://github.com/userdashboard/storage-edis) |
| Amazon S3 | Minimum speed and minimum scaling cost | [@userdashboard/storage-s3](https://npmjs.com/package/@userdashboard/storage-s3) | [github](https://github.com/userdashboard/storage-s3) |
| PostgreSQL | Medium speed and medium scaling cost | [@userdashboard/storage-postgresql](https://npmjs.com/package/@userdashboard/storage-postgresql) | [github](https://github.com/userdashboard/storage-postgresql) |

# Dashboard modules

Dashboard is modular, and by itself it provides only the signing in and account management pages and API routes.  Modules add new pages and API routes for additional functionality.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| MaxMind GeoIP | IP address-based geolocation | [@userdashboard/maxmind-geoip](https://npmjs.com/package/userdashboard/maxmind-geoip)| [github](https://github.com/userdashboard/maxmind-geoip) |
| Organizations | User created groups | [@userdashboard/organizations](https://npmjs.com/package/userdashboard/organizations) | [github](https://github.com/userdashboard/organizations) |
| Stripe Subscriptions | SaaS functionality | [@userdashboard/stripe-subscriptions](https://npmjs.com/package/userdashboard/stripe-subscriptions) | [github](https://github.com/userdashboard/stripe-subscriptions) |
| Stripe Connect | Marketplace functionality | [@userdashboard/stripe-connect](https://npmjs.com/package/userdashboard/stripe-connect) | [github](https://github.com/userdashboard/stripe-connect)

Modules are NodeJS packages that you install with NPM:

    $ npm install @userdashboard/stripe-subscriptions

You need to notify Dashboard which modules you are using in `package.json` conffiguration:

    "dashboard": {
      "modules": [
        "@userdashboard/stripe-subscriptions"
      ]
    }


If you have built your own modules you may submit a pull request to add them to this list.  

# Customizing registration information

By default users may register with just a username and password, both of which are encrypted so they cannot be used for anything but signing in.  You can specify additional fields to require in an environment variable:

        REQUIRE_PROFILE=true
        PROFILE_FIEDLS=any,combination

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

# Creating modules for Dashboard

A module is a NodeJS application too.  It should use the same folder structure as Dashboard.  When Dashboard starts it scans its own files, and then any modules, to create a combined sitemap of UI and API routes.  You can browse the official modules' source to see examples.

    $ mkdir my-module
    $ cd my-module
    $ npm install @userdashboard/dashboard --no-save
    # create main.js to start the server
    # create index.js optionally exporting any relevant API
    # add your content
    $ npm publish

The "--no-save" flag is used to install Dashboard, this prevents your module from requiring a specific version of Dashboard when it is being installed by users.

When your module is published users can install it with NPM:

    $ npm install your_module_name

Modules must be activated in a web app's package.json:

    dashboard: {
        modules: [ "your_module_name" ]
    }

These paths have special significance:

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
| `/src/www/webhooks/YOUR_MODULE/` | Endpoints for receiving webhooks (if applicable) |

Content pages may export `before`, `get` and `post` methods.  API routes may export `before`, `get`, `post`, `patch`, `delete`, `put` methods.   If specified, the `before` methods will execute before any `verb`.
 
Guest-accessible content and API routes can be flagged in the HTML or NodeJS:

    # HTML
    <html auth="false">

    # NodeJS API route
    { 
        auth: false,
        get: (req) = > {

        }
    }

Content can occupy the full screen without the template via a flag in the HTML or NodeJS:

    # HTML
    <html template="false">

    # NodeJS page handler
    { 
        template: false,
        get: (req, res) = > {

        }
    }

Your module can add links to the account and administrator menus in its package.json:

    {
        dashboard: {
            "menus": {
                "administrator": [
                    {
                    "href": "/administrator/your_module_name",
                    "text": "Administrator link",
                    "object": "link"
                    }
                ],
                "account": [
                    {
                    "href": "/account/your_module_name",
                    "text": "Account link",
                    "object": "link"
                    }
                ]
            },
        }
    }

Your module can add `server` and `content` handlers that manipulate requests or responses as they occur:

    {
        dashboard: {
            "server": [
                "/src/server/my-request-modifier.js"
            ],
            "content": [
                "/src/content/my-content-modifier.js"
            ]
        }
    }
    
# Support and contributions

If you have encountered a problem post an issue on the appropriate [Github repository](https://github.com/userdashboard).  

If you would like to contribute check [Github Issues](https://github.com/userdashboard/dashboard) for ways you can help. 

For help using or contributing to this software join the freenode IRC `#userdashboard` chatroom - [Web IRC client](https://kiwiirc.com/nextclient/).

## License

This software is licensed under the MIT license, a copy is enclosed in the `LICENSE` file.  Included icon assets and the CSS library `pure-min` is licensed separately, refer to the `icons/licenses` folder and `src/www/public/pure-min.css` file for their licensing information.

Copyright (c) 2017 - 2020 Ben Lowry

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.