import axios from 'axios';

export const Api = axios.create({
    baseURL: 'https://reactjsmachinetestapi.xicom.us/v1/',
    timeout: 30000
});