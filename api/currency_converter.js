const axios = require('axios');

BASE_URL = "https://free.currencyconverterapi.com/api/v6/"

module.exports = {
    getRate(source, destination) {
        query = `${source}_${destination}`;
        return axios.get(`${BASE_URL}convert?q=${query}&compact=ultra`);
    }
};
// https://free.currencyconverterapi.com/api/v6/convert?q=USD_PHP&compact=y