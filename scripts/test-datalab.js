const axios = require('axios');

(async () => {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET');
    process.exit(1);
  }

  const body = {
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    timeUnit: 'week',
    category: '50000005', // 분야 cat_id (해외여행)
    keyword: [
      { name: '푸꾸옥', param: ['푸꾸옥'] },
      { name: '다낭',   param: ['다낭'] }
    ]
  };

  try {
    const { data } = await axios.post(
      'https://openapi.naver.com/v1/datalab/shopping/category/keywords',
      body,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('ERR', e.response?.status, e.response?.data || e.message);
    process.exit(2);
  }
})();
