const envConf ={
    mongoDbConnectionString : String(process.env.MONGODB_CONNECTION_STRING),
    port : String(process.env.PORT),
    corsOrigin : String(process.env.CORS_ORIGIN)
}

export default envConf