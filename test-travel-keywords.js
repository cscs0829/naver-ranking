const axios = require('axios');

// 해외여행 카테고리에서 다양한 키워드 테스트
async function testTravelKeywords() {
  const clientId = 'MU3rgzUHPMzSSeOUP17I';
  const clientSecret = 'fojuEbHYY4';
  const baseUrl = 'https://openapi.naver.com/v1/datalab/shopping';

  // 테스트할 키워드들
  const testKeywords = [
    '여행',
    '관광',
    '휴가',
    '여행사',
    '항공권',
    '호텔',
    '리조트',
    '펜션',
    '게스트하우스',
    '렌터카',
    '여행용품',
    '캐리어',
    '여행가방',
    '여행용어',
    '여행용품',
    '여행용품',
    '여행용품',
    '여행용품',
    '여행용품',
    '여행용품'
  ];

  console.log('=== 해외여행 카테고리 (50000005) 키워드 테스트 ===');
  
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
        }
      });
      
      // 1초 대기 (API 호출 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`배치 ${Math.floor(i/5) + 1} 실패:`, error.response?.data || error.message);
    }
  }

  // 다른 카테고리와 비교 테스트
  console.log('\n=== 비교: 패션의류 카테고리 (50000000) ===');
  try {
    const requestBody = {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      timeUnit: 'date',
      category: '50000000', // 패션의류 카테고리
      keyword: [
        { name: '여성의류', param: ['여성의류'] },
        { name: '남성의류', param: ['남성의류'] },
        { name: '아동의류', param: ['아동의류'] }
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

testTravelKeywords().catch(console.error);
