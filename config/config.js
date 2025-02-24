const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');
const { encryptData, decryptData } = require('@crypto');

const CONFIG_FILE = path.join(__dirname, 'config.json');

// Load `.env` as fallback
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load Configuration from File
const loadConfigFromFile = () => {
  if (fs.existsSync(CONFIG_FILE)) {
    const encryptedData = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(decryptData(encryptedData));
  }
  return null;
};

// Validate Configuration Schema
const envVarsSchema = Joi.object({
  APPNAME: Joi.string().required(),
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  PORT: Joi.number().default(3000),
  APP_URL: Joi.string().required(),
  APP_KEY: Joi.string().required(),
  
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),
  
  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().optional().allow(''),
  SMTP_USERNAME: Joi.string().optional().allow(''),
  SMTP_PASSWORD: Joi.string().optional().allow(''),
  EMAIL_FROM: Joi.string().optional().allow(''),

  LOG_DIR: Joi.string().allow('').default(null),
  LOG_LEVEL: Joi.string().valid('debug','info','verbose','http','warn','error').required(),
  LOG_MAX_SIZE: Joi.number().required(),
  LOG_MAX_AGE: Joi.number().required(),
  LOG_ZIPPED: Joi.boolean().default(false),
  LOG_FREQUENCY: Joi.string().valid('daily','hourly').required(),
}).unknown();

// Load Configuration (From File or .env)
let loadedConfig = loadConfigFromFile() || process.env;

// Validate Loaded Config
const { value: envVars, error } = envVarsSchema.validate(loadedConfig);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  appName: envVars.APPNAME,
  appUrl: envVars.APP_URL,
  appSecret: envVars.APP_KEY,
  log: {
    directory: envVars.LOG_DIR,
    levels: envVars.LOG_LEVEL,
    maxSize: envVars.LOG_MAX_SIZE,
    maxAges: envVars.LOG_MAX_AGE,
    zipped: envVars.LOG_ZIPPED,
    frequency: envVars.LOG_FREQUENCY,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};

const configFile = (vars) => ({
  APPNAME: vars.appName,
  NODE_ENV: vars.env,
  PORT: vars.port,
  APP_URL: vars.appUrl,
  APP_KEY: vars.appSecret,
  
  JWT_SECRET:vars.jwt.secret,
  JWT_ACCESS_EXPIRATION_MINUTES: vars.jwt.accessExpirationMinutes,
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: vars.jwt.resetPasswordExpirationMinutes,
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: vars.jwt.verifyEmailExpirationMinutes,
  
  SMTP_HOST: vars.email.smtp.host,
  SMTP_PORT: vars.email.smtp.port,
  SMTP_USERNAME: vars.email.smtp.auth.user,
  SMTP_PASSWORD: vars.email.smtp.auth.pass,
  EMAIL_FROM: vars.email.from,

  LOG_DIR: vars.log.directory,
  LOG_LEVEL: vars.log.levels,
  LOG_MAX_SIZE:  vars.log.maxSize,
  LOG_MAX_AGE:  vars.log.maxAges,
  LOG_ZIPPED: vars.log.zipped,
  LOG_FREQUENCY:vars.log.frequency,
})
// Save to File if Missing
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, encryptData(JSON.stringify(configFile(config))), 'utf8');
}

// Update Config at Runtime
const updateConfig = (newConfig) => {
  // Load existing config from file
  const existingConfig = loadConfigFromFile() || configFile(config);

  // Merge newConfig into existing config
  const updatedConfig = { ...existingConfig, ...configFile(newConfig) };

  // Validate merged config
  const { value, error } = envVarsSchema.validate(updatedConfig);
  if (error) {
    throw new Error(`Invalid configuration: ${error.message}`);
  }

  // Save encrypted config back to file
  fs.writeFileSync(CONFIG_FILE, encryptData(JSON.stringify(value)), 'utf8');

  // Apply the new configuration in-memory
  Object.assign(config, value);
};


module.exports = { config, updateConfig };
