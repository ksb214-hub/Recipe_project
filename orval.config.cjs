module.exports = {
  'zeronaeng-api': {
    input: './openapi.json', // 로컬 샘플 파일 사용
    output: {
      mode: 'tags-split',
      target: './src/api/generated/petstore.ts',
      schemas: './src/api/model',
      client: 'axios',
      override: {
        mutator: {
          path: './src/api/api.js', // 기존 axios 인스턴스 연결
          name: 'default',
        },
      },
    },
  },
};