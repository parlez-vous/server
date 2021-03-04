import { isString } from 'lodash'
const { PORT } = process.env

type ProcessEnv = typeof process.env

const env = process.env

const verifyEnv = (envName: keyof ProcessEnv): string => {
  const value = env[envName]

  if (!isString(value)) {
    throw new Error(`Invalid '${envName}' variable: ${value}`)
  }

  return value
}

if (!PORT) {
  throw new Error('PORT is undefined')
}

const serverPort_ = parseInt(PORT, 10)

if (Number.isNaN(serverPort_)) {
  throw new Error('PORT is not a number')
}

export const serverPort = serverPort_
export const discordWebhookUrl = verifyEnv('DISCORD_ERROR_WEBHOOK_URL')
