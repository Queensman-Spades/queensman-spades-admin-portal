// https://hasura-cf57bf4d.nhost.app/v1/graphql
// https://backend-cf57bf4d.nhost.app
// secret 9f3c57cbf94b42e7295071d31df3e6e8

// https://hasura-8106d23e.nhost.app/v1/graphql
// https://backend-8106d23e.nhost.app
// secret d71e216c844d298d91fbae2407698b22

// https://meqmfvxx0d.execute-api.us-east-1.amazonaws.com/production

// https://y8sr1kom3g.execute-api.us-east-1.amazonaws.com/dev/


const SERVERLESS_STAGING = 'y8sr1kom3g'
const SERVERLESS_PROD = 'meqmfvxx0d'

let DOMAIN = ``
if (process.env.REACT_APP_VERCEL_ENV === 'production') {
    console.log("prod")
    DOMAIN = `https://${SERVERLESS_PROD}.execute-api.us-east-1.amazonaws.com/production`
} else {
    console.log("Dev")
    DOMAIN = `https://${SERVERLESS_STAGING}.execute-api.us-east-1.amazonaws.com/dev`
}
module.exports = {
    DOMAIN
    //  DOMAIN: "https://meqmfvxx0d.execute-api.us-east-1.amazonaws.com/production"
    // Change domain to above url for produciton dev
}