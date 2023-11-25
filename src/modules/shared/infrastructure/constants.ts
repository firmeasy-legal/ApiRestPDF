
export const rootDir = process.cwd()
export const serverPort = 3000
export const amountPasswordSaltRounds = 10
export const jwtAuthSecret = `${process.env.JWT_AUTH_SECRET}`

export const logsDatabase = "logs"

const databaseDriver = process.env.DATABASE_DRIVER
const databaseHost = process.env.DATABASE_HOST
const databaseUser = process.env.DATABASE_USER
const databasePass = process.env.DATABASE_PASS
const databasePort = process.env.DATABASE_PORT
export const databaseName = process.env.DATABASE_NAME

export const databaseUrl = `${databaseDriver}://${databaseUser}:${databasePass}@${databaseHost}:${databasePort}`