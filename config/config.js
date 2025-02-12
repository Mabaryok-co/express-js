const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');
const { encryptData, decryptData } = require('../library/crypto');

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
    APP_SECRET: Joi.string().required(),
    
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),
    
    SMTP_HOST: Joi.string().optional(),
    SMTP_PORT: Joi.number().optional(),
    SMTP_USERNAME: Joi.string().optional(),
    SMTP_PASSWORD: Joi.string().optional(),
    EMAIL_FROM: Joi.string().optional(),
}).unknown();

// Load Configuration (From File or .env)
let loadedConfig = loadConfigFromFile() || process.env;

// Validate Loaded Config
const { value: envVars, error } = envVarsSchema.validate(loadedConfig);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Save to File if Missing
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(encryptData(envVars)), 'utf8');
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
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

// Update Config at Runtime
const updateConfig = (newConfig) => {
    // Load existing config from file
    const existingConfig = loadConfigFromFile() || config;
  
    // Merge newConfig into existing config
    const updatedConfig = { ...existingConfig, ...newConfig };
  
    // Validate merged config
    const { value, error } = envVarsSchema.validate(updatedConfig);
    if (error) {
      throw new Error(`Invalid configuration: ${error.message}`);
    }
  
    // Save encrypted config back to file
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(encryptData(value)), 'utf8');
  
    // Apply the new configuration in-memory
    Object.assign(config, value);
  };
  

module.exports = { config, updateConfig };
