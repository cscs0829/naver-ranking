const axios = require('axios');

// 동남아/푸꾸옥 키워드 테스트
async function testSoutheastAsiaKeywords() {
  const clientId = 'MU3rgzUHPMzSSeOUP17I';
  const clientSecret = 'fojuEbHYY4';
  const baseUrl = 'https://openapi.naver.com/v1/datalab/shopping';

  // 동남아/푸꾸옥 관련 키워드들
  const testKeywords = [
    '푸꾸옥',
    '베트남',
    '동남아',
    '태국',
    '필리핀',
    '인도네시아',
    '말레이시아',
    '싱가포르',
    '캄보디아',
    '라오스',
    '미얀마',
    '브루나이',
    '동남아여행',
    '베트남여행',
    '태국여행',
    '푸꾸옥여행',
    '발리',
    '보라카이',
    '세부',
    '코타키나발루'
  ];

  console.log('=== 동남아/푸꾸옥 키워드 테스트 ===');
  
  for (let i = 0; i < testKeywords.length; i += 5) {
    const batch = testKeywords.slice(i, i + 5);
    console.log(`\n--- 배치 ${Math.floor(i/5) + 1}: ${batch.join(', ')} ---`);
    
    try {
      const requestBody = {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        timeUnit: 'date',
        category: '50000005', // 해외여행 카테고리
        keyword: batch.map(keyword => ({
          name: keyword,
          param: [keyword]
        }))
      };
      
      const response = await axios.post(`${baseUrl}/category/keywords`, requestBody, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('응답 성공:', response.status);
      response.data.results?.forEach((result, index) => {
        const dataCount = result.data?.length || 0;
        console.log(`  ${result.title}: ${dataCount}개 데이터 ${dataCount > 0 ? '✅' : '❌'}`);
        if (dataCount > 0) {
          console.log(`    첫 번째 데이터: ${JSON.stringify(result.data[0])}`);
          console.log(`    마지막 데이터: ${JSON.stringify(result.data[result.data.length - 1])}`);
        }
      });
      
      // 1초 대기 (API 호출 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`배치 ${Math.floor(i/5) + 1} 실패:`, error.response?.data || error.message);
    }
  }

  // 다른 카테고리에서도 테스트
  console.log('\n=== 패션의류 카테고리에서 동남아 키워드 테스트 ===');
  try {
    const requestBody = {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      timeUnit: 'date',
      category: '50000000', // 패션의류 카테고리
      keyword: [
        { name: '푸꾸옥', param: ['푸꾸옥'] },
        { name: '베트남', param: ['베트남'] },
        { name: '동남아', param: ['동남아'] },
        { name: '태국', param: ['태국'] },
        { name: '여행의류', param: ['여행의류'] }
      ]
    };
    
    const response = await axios.post(`${baseUrl}/category/keywords`, requestBody, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('응답 성공:', response.status);
    response.data.results?.forEach((result, index) => {
      const dataCount = result.data?.length || 0;
      console.log(`  ${result.title}: ${dataCount}개 데이터 ${dataCount > 0 ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('패션의류 테스트 실패:', error.response?.data || error.message);
  }
}

testSoutheastAsiaKeywords().catch(console.error);
