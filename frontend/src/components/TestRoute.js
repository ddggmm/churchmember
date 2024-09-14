import React from 'react';
import { testRouteGet, testRoutePost } from '../utils/api';

function TestRoute() {
  const handleTestGet = async () => {
    try {
      const result = await testRouteGet();
      console.log('GET 테스트 결과:', result);
    } catch (error) {
      console.error('GET 테스트 오류:', error);
    }
  };

  const handleTestPost = async () => {
    try {
      const result = await testRoutePost();
      console.log('POST 테스트 결과:', result);
    } catch (error) {
      console.error('POST 테스트 오류:', error);
    }
  };

  return (
    <div>
      <h2>라우트 테스트</h2>
      <button onClick={handleTestGet}>GET 테스트</button>
      <button onClick={handleTestPost}>POST 테스트</button>
    </div>
  );
}

export default TestRoute;
