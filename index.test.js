/* eslint-env mocha */
const assert = require('assert')
const bcrypt = require('./src/bcrypt.js')
const UUID = require('./src/uuid.js')
const properties = [
  { camelCase: 'pageSize', raw: 'PAGE_SIZE', description: 'Rows of data per page', value: '7', default: '10', valueDescription: 'integer' },
  { camelCase: 'domain', raw: 'DOMAIN', description: 'Domain of server', value: 'example.com', default: '', valueDescription: 'string' },
  { camelCase: 'host', raw: 'HOST', description: 'IP or address web server listens on', value: '0.0.0.0', default: 'localhost', valueDescription: 'ip' },
  { camelCase: 'port', raw: 'PORT', description: 'Port web server listens on', value: '9000', default: '8000', valueDescription: 'integer' },
  { camelCase: 'idLength', raw: 'ID_LENGTH', description: 'Length of random ID', value: '7', default: '8', valueDescription: 'integer' },
  { camelCase: 'allowPublicAPI', raw: 'ALLOW_PUBLIC_API', description: 'Allow HTTP access to /api', value: 'true', default: '', defaultDescription: 'false', valueDescription: 'boolean' },
  { camelCase: 'deleteDelay', raw: 'DELETE_DELAY', description: 'Cool-down time in days to delete accounts', value: '3', default: '7', valueDescription: 'integer' },
  { camelCase: 'applicationServer', raw: 'APPLICATION_SERVER', description: 'URL of application server', value: 'http://localhost:3000', noDefaultValue: true, valueDescription: 'address' },
  { camelCase: 'applicationServerToken', raw: 'APPLICATION_SERVER_TOKEN', description: 'Secret shared between servers', value: 'secret', noDefaultValue: true, valueDescription: 'string' },
  { camelCase: 'bcryptFixedSalt', raw: 'BCRYPT_FIXED_SALT', description: 'Salt for hashing indexed values', value: bcrypt.genSaltSync(10), noDefaultValue: true, valueDescription: 'string' },
  { camelCase: 'bcryptWorkloadFactor', raw: 'BCRYPT_WORKLOAD_FACTOR', description: 'Strength to protect passwords', value: '4', default: '10', valueDescription: 'integer' },
  { camelCase: 'encryptionSecret', raw: 'ENCRYPTION_SECRET', description: '32-character secret string', value: UUID.random(32), noDefaultValue: true, valueDescription: 'string' },
  { camelCase: 'encryptionSecretIV', raw: 'ENCRYPTION_SECRET_IV', description: '16-character secret string', value: UUID.random(16), noDefaultValue: true, valueDescription: 'string' },
  { camelCase: 'language', raw: 'LANGUAGE', description: 'Default, fixed or selectable UI language', value: 'en-us', default: 'en-us', valueDescription: 'languages folder name' },
  { camelCase: 'disableRegistration', raw: 'DISABLE_REGISTRATION', description: 'Disable UI (not API) for registering', value: 'false', default: '', valueDescription: 'boolean' },
  { camelCase: 'dashboardServer', raw: 'DASHBOARD_SERVER', description: 'URL of dashboard server', value: 'http://localhost:8000', default: '', valueDescription: 'address' },
  { camelCase: 'minimumPasswordLength', raw: 'MINIMUM_PASSWORD_LENGTH', description: 'Shortest password length', value: '1', default: '1', valueDescription: 'integer' },
  { camelCase: 'maximumPasswordLength', raw: 'MAXIMUM_PASSWORD_LENGTH', description: 'Longest password length', value: '1000', default: '50', valueDescription: 'integer' },
  { camelCase: 'minimumUsernameLength', raw: 'MINIMUM_USERNAME_LENGTH', description: 'Shortest username length', value: '1', default: '1', valueDescription: 'integer' },
  { camelCase: 'maximumUsernameLength', raw: 'MAXIMUM_USERNAME_LENGTH', description: 'Longest username length', value: '1000', default: '50', valueDescription: 'integer' },
  { camelCase: 'minimumResetCodeLength', raw: 'MINIMUM_RESET_CODE_LENGTH', description: 'Shortest reset code length', value: '1', default: '6', valueDescription: 'integer' },
  { camelCase: 'maximumResetCodeLength', raw: 'MAXIMUM_RESET_CODE_LENGTH', description: 'Longest reset code length', value: '1000', default: '50', valueDescription: 'integer' },
  { camelCase: 'requireProfile', raw: 'REQUIRE_PROFILE', description: 'Require registration information', value: 'true', default: '', valueDescription: 'integer' },
  { camelCase: 'userProfileFields', raw: 'USER_PROFILE_FIELDS', description: 'Information to collect at registration', value: 'full-name,contact-email,display-name,display-email,dob,location,phone,company-name,website,occupation', default: 'contact-email,full-name', valueDescription: 'Profile property list' }
]

describe('index', () => {
  for (const property of properties) {
    describe(property.raw, () => {
      describe(property.description, () => {
        if (!property.noDefaultValue) {
          it('default ' + (property.default || property.defaultDescription || 'unset'), async () => {
            if (property.raw.startsWith('APPLICATION_SERVER')) {
              if (property.raw === 'APPLICATION_SERVER') {
                process.env.APPLICATION_SERVER_TOKEN = 'a secret string'
              } else {
                process.env.APPLICATION_SERVER = 'http://localhost:1234'
              }
            }
            if (property.raw.startsWith('ENCRYPTION_')) {
              if (property.raw === 'ENCRYPTION_SECRET') {
                process.env.ENCRYPTION_SECRET_IV = UUID.random(16)
              } else {
                process.env.ENCRYPTION_SECRET = UUID.random(32)
              }
            }
            delete (process.env[property.raw])
            delete require.cache[require.resolve('./index.js')]
            require('./index.js')
            delete require.cache[require.resolve('./index.js')]
            assert.strictEqual((global[property.camelCase] || '').toString().trim(), property.default.toString())
          })
        }
        it(property.valueDescription, async () => {
          process.env[property.raw] = property.value
          if (property.raw.startsWith('APPLICATION_SERVER')) {
            if (property.raw === 'APPLICATION_SERVER') {
              process.env.APPLICATION_SERVER_TOKEN = 'a secret string'
            } else {
              process.env.APPLICATION_SERVER = 'http://localhost:1234'
            }
          }
          if (property.raw.startsWith('ENCRYPTION_')) {
            if (property.raw === 'ENCRYPTION_SECRET') {
              process.env.ENCRYPTION_SECRET_IV = UUID.random(16)
            } else {
              process.env.ENCRYPTION_SECRET = UUID.random(32)
            }
          }
          delete require.cache[require.resolve('./index.js')]
          require('./index.js')
          delete require.cache[require.resolve('./index.js')]
          assert.strictEqual(global[property.camelCase].toString(), property.value)
        })
      })
    })
  }
})
