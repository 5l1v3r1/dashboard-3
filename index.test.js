/* eslint-env mocha */
const assert = require('assert')
const bcrypt = require('./src/bcrypt.js')
const UUID = require('./src/uuid.js')
const properties = [
    { camelCase: 'pageSize', raw: 'PAGE_SIZE', description: 'Rows of data per page', value: '7' },
    { camelCase: 'domain', raw: 'DOMAIN', description: 'Domain of server', value: 'example.com' },
    { camelCase: 'host', raw: 'HOST', description: 'IP or address web server listens on', value: '0.0.0.0' },
    { camelCase: 'port', raw: 'PORT', description: 'Port web server listens on', value: '8000' },
    { camelCase: 'idLength', raw: 'ID_LENGTH', description: 'Length of random ID', value: '7' },
    { camelCase: 'allowPublicAPI', raw: 'ALLOW_PUBLIC_API', description: 'Allow HTTP access to /api', value: 'true' },
    { camelCase: 'deleteDelay', raw: 'DELETE_DELAY', description: 'Cool-down time in days to delete accounts', value: '7' },
    { camelCase: 'applicationServer', raw: 'APPLICATION_SERVER', description: 'URL of application server', value: 'http://localhost:3000' },
    { camelCase: 'applicationServerToken', raw: 'APPLICATION_SERVER_TOKEN', description: 'Secret shared between servers', value: 'secret' },
    { camelCase: 'bcryptFixedSalt', raw: 'BCRYPT_FIXED_SALT', description: 'Salt for hashing indexed values', value: bcrypt.genSaltSync(10) },
    { camelCase: 'bcryptWorkloadFactor', raw: 'BCRYPT_WORKLOAD_FACTOR', description: 'Strength to protect passwords', value: '10' },
    { camelCase: 'encryptionSecret', raw: 'ENCRYPTION_SECRET', description: '32-character secret string', value: UUID.random(32) },
    { camelCase: 'encryptionSecretIV', raw: 'ENCRYPTION_SECRET_IV', description: '16-character secret string', value: UUID.random(16) },
    { camelCase: 'language', raw: 'LANGUAGE', description: 'Default, fixed or selectable UI language', value: 'en-US' },
    { camelCase: 'disableRegistration', raw: 'DISABLE_REGISTRATION', description: 'Disable UI (not API) for registering', value: 'false' },
    { camelCase: 'dashboardServer', raw: 'DASHBOARD_SERVER', description: 'URL of dashboard server', value: 'http://localhost:8000' },
    { camelCase: 'minimumPasswordLength', raw: 'MINIMUM_PASSWORD_LENGTH', description: 'Shortest password length', value: '1' },
    { camelCase: 'maximumPasswordLength', raw: 'MAXIMUM_PASSWORD_LENGTH', description: 'Longest password length', value: '1000' },
    { camelCase: 'minimumUsernameLength', raw: 'MINIMUM_USERNAME_LENGTH', description: 'Shortest username length', value: '1' },
    { camelCase: 'maximumUsernameLength', raw: 'MAXIMUM_USERNAME_LENGTH', description: 'Longest username length', value: '1000' },
    { camelCase: 'minimumResetCodeLength', raw: 'MINIMUM_RESET_CODE_LENGTH', description: 'Shortest reset code length', value: '1' },
    { camelCase: 'maximumResetCodeLength', raw: 'MAXIMUM_RESET_CODE_LENGTH', description: 'Longest reset code length', value: '1000' },
    { camelCase: 'requireProfile', raw: 'REQUIRE_PROFILE', description: 'Require registration information', value: 'true' },
    { camelCase: 'userProfileFields', raw: 'USER_PROFILE_FIELDS', description: 'Information to collect at registration', value: 'full-name, contact-email, display-name, display-email, dob, location, phone, company-name, website, occupation' },
]

describe('index', () => {
  for (const property of properties) {
    describe(property.raw, () => {
        it (property.description, async () => {
            process.env[property.raw] = property.value
            if (property.raw.startsWith('APPLICATION_SERVER')) {
                if (property.raw === 'APPLICATION_SERVER') {
                    process.env.APPLICATION_SERVER_TOKEN = 'required'
                } else {
                    process.env.APPLICATION_SERVER = 'http://required'
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
  }
})
