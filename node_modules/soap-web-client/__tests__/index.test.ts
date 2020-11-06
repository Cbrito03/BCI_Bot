const fs = require('fs');
const soaptestrequest = require('../src/index');
const axiosTest = require('axios');
const MockAdapter = require('axios-mock-adapter');
const Mock = new MockAdapter(axiosTest);

const url = 'http://www.dneonline.com/calculator.asmx';
const failureURl = 'http://www.dneonline.com/failure/calculator.asmx'
const data = fs.readFileSync('__tests__/_resource/request1.xml', 'utf-8');
const responseData = fs.readFileSync('__tests__/_resource/response1.xml', 'utf-8');
const failureData = fs.readFileSync('__tests__/_resource/request2.xml', 'utf-8');
const failureResponseData = fs.readFileSync('__tests__/_resource/response2.xml', 'utf-8')
const headers = {
    'Content-Type': `text/xml; charset=utf-8`,
    'Content-Length': Infinity,
    'SOAPAction': "http://tempuri.org/Add"
};
test('soaprequestTest', async () => {
    const axiosResponse = responseData;
    Mock.onPost(url).reply(200, axiosResponse)
    let { response } = await soaptestrequest({ url, data, headers });
    expect(response.body).toEqual(responseData);
    expect(response.status).toEqual(200);
});

test('soaprequestTest failure', async () => {
    const failAxiosResponse = failureResponseData;
    Mock.onPost(failureURl).reply(200, failAxiosResponse);
    let response: any;
    try {
        response = await soaptestrequest({ url: failureURl, data: failureData, headers});
    } catch (exception) {
        console.log('service failure due to ', exception);
    }
    expect(response.status).not.toEqual(200);
});

test('soaprequestTest failure for timeout', async () => {
    Mock.onPost(failureURl).timeout();
    let response: any;
    let status : any;
    try {
        response = await soaptestrequest({ url: failureURl, data: failureData, headers});
        status = {response};
    } catch (exception) {
        //console.log('service failure due to ', exception);
    }
    expect(status).not.toEqual(200);
});

