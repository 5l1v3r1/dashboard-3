# Dashboard
![Test suite status](https://github.com/userdashboard/dashboard/workflows/test-and-publish/badge.svg?branch=master)

Dashboard provides the user boilerplate web apps require for users to register, create groups, subscription billing with Stripe etc.

You write your application server in any language and Dashboard runs in parallel.  Users browse your Dashboard server's URL and it serves its own content for account-related requests and proxies your application server for everything else.  An application server needs to serve a guest landing page on `/` and your web app on `/home`, and optionally any other URLs you require.

Dashboard is a stateless web server designed to scale horizontally, written in NodeJS.  You can publish it to Heroku or similar PaaS and run multiple instances, or use web hosts like Digital Ocean, Vultr, AWS etc load balancing services they provide.  In production you should have at least 2 instances of the server sharing requests for basic redundancy.

Dashboard's UI offers a generic account management and administration interface resembling the last two decades of web applications.  Your application server can serve two special CSS files, `/public/template-additional.css` and `/public/content-additional.css` to theme the Dashboard template and content.  If your server does not provide these files your Dashboard server will respond with blank files rather than 404 errors.

Your content can occupy the full screen with `<html data-template="false">`.  Your content can be accessible to guests by specifying `<html data-auth="false">`.  The content you serve can include a `<template id="head"></template>` with HTML to be copied into Dashboard's template `<HEAD>` tag.  You can use Dashboard's navigation bar by providing a `<template id="navbar"></template>` with your HTML links.

Your application server can access Dashboard's APIs on behalf of your users and administrators to do anything Dashboard's UI offers and more.

# Hosting Dashboard yourself

Dashboard requires NodeJS `12.16.3` be installed.

    $ mkdir my-dashboard-server
    $ cd my-dashboard-server
    $ npm init
    $ npm install @userdashboard/dashboard
    $ echo "require('@userdashboard/dashboard').start(__dirname)" > main.js
    $ node main.js

# Configuration

Dashboard hashes passwords, usernames and account reset codes with random salts.  Some other fields are hashed with a fixed salt that allows the hashed value to still determine uniqueness and existance.  Each Dashboard server must create its own fixed salt.

        $ node
        > const bcrypt = require('bcryptjs')
        > bcrypt.genSaltSync(4)

If you are hosting Dashboard on Heroku you will need to escape the `$` with `/` on the CLI when setting 

        heroku config:add BCRYPT_FIXED_SALT=\$02\$04\$xxxxxxx

Check the `env.txt` or online documentation for more configuration variables.

# Customize registration information

By default users may register with just a username and password, both of which are encrypted so they cannot be used for anything but signing in.  You can specify some personal information fields to require in an environment variable:

        REQUIRE_PROFILE=true
        PROFILE_FIELDS=any,combination

| Field         | Description                |
|---------------|----------------------------|
| full-name     | First and last name        |
| contact-email | Contact email              |
| display-name  | Name to display to users   |
| display-email | Email to display to users  |
| dob           | Date of birth              |
| location      | Location description       |
| phone         | Phone number               |
| company-name  | Company name               |
| website       | Website                    |
| occupation    | Occupation                 |

# Adding links to the account or administrator menus

Your web application can add links to the account and administrator menus in its `package.json`:

    {
        dashboard: {
            "menus": {
                "administrator": [
                    {
                    "href": "/administrator/manage-things",
                    "text": "Manage things",
                    "object": "link"
                    }
                ],
                "account": [
                    {
                    "href": "/mortgage-calculator",
                    "text": "Mortgage calculator",
                    "object": "link"
                    }
                ]
            },
        }
    }

# Access user data from your application server

You can access the Dashboard HTTP APIs on behalf of the user making requests.  Dashboard and its modules are entirely API-driven so your application server can retrieve, modify or create any user data.   This example uses NodeJS to fetch the user's account from the Dashboard server.

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
        const proxyRequest = require('jj').request(requestOptions, (proxyResponse) => {
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

# Storage backends

Dashboard by default uses local disk, this is good for development and under certain circumstances but generally you should use any of Redis, PostgreSQL, MySQL, MongoDB or S3-compatible for storage.

|                                                                                                                                             | Name        | Description                             | Package                                                                                          | Repository                                                    |
|---------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| ![Test suite status using file system](https://github.com/userdashboard/dashboard/workflows/test-fs/badge.svg?branch=master)                | File system | For development and single-server apps  | -                                                                                                | -                                                             |
| ![Test suite status using S3 storage](https://github.com/userdashboard/dashboard/workflows/test-s3/badge.svg?branch=master)                 | Amazon S3   | Minimum speed and minimum scaling cost  | [@userdashboard/storage-s3](https://npmjs.com/package/@userdashboard/storage-s3)                 | [github](https://github.com/userdashboard/storage-s3)         |
| ![Test suite status using MySQL storage](https://github.com/userdashboard/dashboard/workflows/test-mysql/badge.svg?branch=master)           | MySQL       | Medium speed and medium scaling cost    | [@userdashboard/storage-mysql](https://npmjs.com/package/@userdashboard/storage-mysql)           | [github](https://github.com/userdashboard/storage-mysql)      |
| ![Test suite status using MongoDB storage](https://github.com/userdashboard/dashboard/workflows/test-mongodb/badge.svg?branch=master)       | MongoDB     | Medium speed and medium scaling cost    | [@userdashboard/storage-mongodb](https://npmjs.com/package/@userdashboard/storage-mongodb)       | [github](https://github.com/userdashboard/storage-mongodb)    |
| ![Test suite status using PostgreSQL storage](https://github.com/userdashboard/dashboard/workflows/test-postgresql/badge.svg?branch=master) | PostgreSQL  | Medium speed and medium scaling cost    | [@userdashboard/storage-postgresql](https://npmjs.com/package/@userdashboard/storage-postgresql) | [github](https://github.com/userdashboard/storage-postgresql) |
| ![Test suite status using Redis storage](https://github.com/userdashboard/dashboard/workflows/test-redis/badge.svg?branch=master)           | Redis       | Maximum speed and maximum scaling cost  | [@userdashboard/storage-redis](https://npmjs.com/package/@userdashboard/storage-redis)           | [github](https://github.com/userdashboard/storage-edis)       |

You can activate a storage backend with an environment variable.  Each have unique configuration requirements specified in their readme files.

    $ STORAGE=@userdashboard/storage-mongodb \
      MONGODB_URL=mongodb:/.... \
      node main.js

## Storage caching

You can complement your storage backend with caching.

|                                                                                                                                         |Name    | Description                            | Package                                                                                  | Repository                                             |
|-----------------------------------------------------------------------------------------------------------------------------------------|--------|----------------------------------------|------------------------------------------------------------------------------------------|--------------------------------------------------------|
| ![Test suite status using NodeJS caching](https://github.com/userdashboard/dashboard/workflows/test-node-cache/badge.svg?branch=master) | NodeJS | For development and single-server apps | -                                                                                        | -                                                      |
| ![Test suite status using Redis caching](https://github.com/userdashboard/dashboard/workflows/test-redis-cache/badge.svg?branch=master) | Redis  | For speeding up disk-based storage     | [@userdashboard/storage-redis](https://npmjs.com/package/@userdashboard/storage-redis) | [github](https://github.com/userdashboard/storage-redis) |

You can optionally use Redis as a cache, this is good for any storage on slow disks.

    $ CACHE=@userdashboard/storage-cache-redis \
      CACHE_REDIS_URL=redis:/.... \
      node main.js

If you have a single Dashboard server you can cache within memory:

    $ CACHE=node \
      node main.js

# Logging

By default Dashboard does not have any active `console.*` being emitted.  You can enable logging with `LOG_LEVEL` containing a list of valid console.* methods.

    $ LOG_LEVEL=log,warn,info,error node main.js

Override Dashboard's logging by creating your own `log.js` in the root of your project:

    module.exports = (group) => {
      return {
        log: () => {
        },
        info: () => {
        },
        warn: () => {
        }
      }
    }

# Localization

Dashboard has been automatically-localized into a variety of languages.  You can submit corrections by editing the HTML files directly on Github in the `languages` folder in Dashboard and its official modules, except the `maxmind-geoip` module which has no UI to translate.

Users can specify their preferred language, timezone, date and formatting in their account settings.

You can set the language with an environment variable:

    LANGUAGE=es node main.js

By default users may not customize language settings.  You can enable the option with an environment variable:

    ENABLE_LANGUAGE_PREFERENCE=true LANGUAGE=en node main.js

# Dashboard modules

Dashboard is modular and by itself it provides only the signing in, account management and basic administration.  Modules add new pages and API routes for additional functionality.

| Name                 | Description                   | Package                                                                                             | Repository                                                      |
|----------------------|-------------------------------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| MaxMind GeoIP        | IP address-based geolocation  | [@userdashboard/maxmind-geoip](https://npmjs.com/package/userdashboard/maxmind-geoip)               | [github](https://github.com/userdashboard/maxmind-geoip)        |
| Organizations        | User created groups           | [@userdashboard/organizations](https://npmjs.com/package/userdashboard/organizations)               | [github](https://github.com/userdashboard/organizations)        |
| Stripe Connect       | Marketplace functionality     | [@userdashboard/stripe-connect](https://npmjs.com/package/userdashboard/stripe-connect)             | [github](https://github.com/userdashboard/stripe-connect)       |
| Stripe Subscriptions | SaaS functionality            | [@userdashboard/stripe-subscriptions](https://npmjs.com/package/userdashboard/stripe-subscriptions) | [github](https://github.com/userdashboard/stripe-subscriptions) |

Modules are NodeJS packages that you install with NPM:

    $ npm install @userdashboard/stripe-subscriptions

You need to notify Dashboard which modules you are using in `package.json` conffiguration:

    "dashboard": {
      "modules": [
        "@userdashboard/stripe-subscriptions"
      ]
    }

If you have built your own modules you may submit a pull request to add them to this list.  

Dashboard modules are able to use their own storage and cache settings:

    $ SUBSCRIPTIONS_STORAGE=@userdashboard/storage-postgresql \
      SUBSCRIPTIONS_DATABASE_URL=postgres://localhost:5432/subscriptions \
      ORGANIZATIONS_STORAGE=@userdashboard/storage-postgresql \
      ORGANIZATIONS_DATABASE_URL=postgres://localhost:5433/organizations \
      STORAGE=@userdashboard/storage-redis \
      REDIS_URL=redis://localhost:6379 \
      node main.js

# Creating modules for Dashboard

A module is a NodeJS application with the same folder structure as Dashboard.  When Dashboard starts it scans its own files, and then any modules specified in the `package.json` to create a combined sitemap of UI and API routes.  You can browse the official modules' source to see examples.

    $ mkdir my-module
    $ cd my-module
    $ npm install @userdashboard/dashboard --no-save
    # create main.js to start the server
    # create index.js optionally exporting any relevant API
    # add your content
    $ npm publish

The "--no-save" flag is used to install Dashboard, this prevents your module from installing a redundant version of Dashboard when it is being installed by users.

When your module is published users can install it with NPM:

    $ npm install your_module_name

Modules must be activated in a web app's `package.json`:

    dashboard: {
        modules: [ "your_module_name" ]
    }

These paths have special significance:

| Folder                                    | Description                                      |
|-------------------------------------------|--------------------------------------------------|
| `/src/www`                                | Web server root                                  |
| `/src/www/public`                         | Static assets served quickly                     |
| `/src/www/account`                        | User account management pages                    |
| `/src/www/account/YOUR_MODULE/`           | Your additions (if applicable)                   |
| `/src/www/administrator`                  | Administration pages                             |
| `/src/www/administrator/YOUR_MODULE/`     | Your additions (if applicable)                   |
| `/src/www/api/user`                       | User account management pages                    |
| `/src/www/api/user/YOUR_MODULE/`          | Your additions (if applicable)                   |
| `/src/www/api/administrator`              | Administration APIs                              |
| `/src/www/api/administrator/YOUR_MODULE/` | Your additions (if applicable)                   |
| `/src/www/webhooks/YOUR_MODULE/`          | Endpoints for receiving webhooks (if applicable) |

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

Your module can add links to the account and administrator menus in its `package.json`:

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

Your module can add `server` handlers that manipulate requests, `content` handlers that adjust the rendered content, and `proxy` handlers that add to header information sent to application servers.

    {
        dashboard: {
            "server": [
                "/src/server/my-request-modifier.js"
            ],
            "content": [
                "/src/content/my-content-modifier.js"
            ],
            "proxy": [
                "/src/proxy/my-header-additions.js"
            ]
        }
    }

Server handlers can execute `before` and/or `after` a visitor is identified as a guest or user:

    module.exports = {
        before: async (req, res) => {
        },
        after: async (req, res) => {
        }
    }

Content handlers can adjust the `template` and `page` documents before they are served to the user:

    module.exports = {
        page: async (req, res, pageDoc) => {
        },
        template: async (req, res, templateDoc) => {
        }
    }

Proxy handlers can add to the headers sent to application servers:
    
    module.exports = async (req, proxyRequestOptions) => {
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