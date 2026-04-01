module.exports = {
  regApi: {
    input: './src/openapi/reg-api.yaml', // 경로
    output: {
      target: './src/api/regApi.ts', // 생성될 파일
      client: 'react-query', // react-query 훅 생성
      override: true,
    },
  },
};