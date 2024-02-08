import axios from 'axios';
const axios = require('axios');

const config = {
  headers: {
    'authorization': 'apikey your_token',
    'content-type': 'application/json'
  }
};

const url = 'https://api.collectapi.com/health/dutyPharmacy?ilce=%C3%87ankaya&il=Ankara';

axios.get(url, config)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
