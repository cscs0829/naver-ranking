const axios = require('axios');

// 제공받은 API 키
const CLIENT_ID = 'MU3rgzUHPMzSSeOUP17I';
const CLIENT_SECRET = 'fojuEbHYY4';

async function testNaverAPI() {
  try {
    console.log('네이버 쇼핑인사이트 API 테스트 시작...');
    
    // 테스트 요청 본문 - 각 키워드 그룹마다 하나의 키워드만
    const requestBody = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      timeUnit: 'month',
      category: '50000005', // 해외여행 카테고리
      keyword: [
        {
          name: '해외여행',
          param: ['해외여행']
        },
        {
          name: '해외패키지',
          param: ['해외패키지']
        },
        {
          name: '해외투어',
          param: ['해외투어']
        }
      ],
      device: '',
      gender: '',
      ages: []
    };

    console.log('요청 본문:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      'https://openapi.naver.com/v1/datalab/shopping/category/keywords',
      requestBody,
      {
        headers: {
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ API 호출 성공!');
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ API 호출 실패:');
    if (error.response) {
      console.error('상태 코드:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else {
      console.error('에러 메시지:', error.message);
    }
  }
}

testNaverAPI();
