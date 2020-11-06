const axios = require('axios').default;
/**
 * @author Joshi Yogesh
 * @param {string} url - URL mentioned in the wsdl {endpoints to hit the soap-request}
 * @param {string} data - XML data which need to be sent to web service
 * @param {object} headers - Header which need to be sent to request
 * @param {object} proxy - Proxy Object with Proxy configuration of Proxy server host name and port number {host : "127.0.0.1",port : 3000, auth : {username : "joshiyogesh" password : "imduffer"}}
 * @param {number} timeout - Specify the number of milliseconds before request timesout, if request take more than specify time out it will be aborted,
 * timeout - 0 specify no timeout
 * @param {number} maxContentLength - max permissable content length that should be pass, by default Infinity 
 * @param {object} extraOptions - Any Extra Options which is supported by axios. 
 * 
 * @return {object} -- {
 *  response : {
 *      message : "SOAP_WEB_CLIENT_SOAP_REQUEST_SUCCESS" or "SOAP_WEB_CLIENT_REQUEST_FAILURE",
 *      data : "In case of Promise Rejection",
 *      body : "In Case of Succesfull Promise",
 *      headers : "In Case of Succesfull Promise",
 *      "status" : "In Case of Succesfull Prmoise"
 *  }
 * }
 */
const soaprequest = ({
    url = '',
    headers = {},
    data = '',
    timeout = 0,
    proxy = {},
    maxContentLength  = Infinity,
    extraOptions = {}
}:{url:string,headers:object,data:string,timeout:number,proxy:object,maxContentLength:number,extraOptions:object}) => {
    return new Promise((resolve,reject)=>{
        axios({
            method : 'post',
            url,
            headers,
            data,
            timeout,
            proxy,
            maxContentLength,
            ...extraOptions
        }).then((response : any)=>{
            resolve({
                response : {
                    headers : response.headers,
                    body : response.data,
                    status : response.status,
                    message : 'SOAP_WEB_CLIENT_REQUEST_SUCCESS'
                }
            })
        }).catch((error : any)=>{
            if(error.response){
                reject({
                    response : {
                        message : 'SOAP_WEB_CLIENT_REQUEST_FAILURE',
                        data : error.response.data
                    }
                })
            }else{
                reject({
                    response : {
                        message : 'SOAP_WEB_CLIENT_REQUEST_FAILURE',
                        data : error
                    }
                })
            }
        })
    })
};

module.exports = soaprequest;
