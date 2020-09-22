import axios from 'axios';
// import serverUrl from '../pages/home/utils';
// import global from './Global';


// const serverUrl = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? '': 'http://3.16.148.142:8080';
const serverUrl = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://localhost:8080': 'http://localhost:8080';

class API {
    getVolatility() {
        return axios.get(`${serverUrl}/api/volatility`);
    }

    checkCurrentPW(data) {
        return axios.post(`${serverUrl}/api/udpate_password`, data);
    }
}

export default new API();
