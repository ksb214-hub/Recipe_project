from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# 추천 로직이 담긴 엔진을 가져옴
from recommender_engine import *

app = FastAPI()

# 프론트엔드(React 등)에서 보내는 요청을 허용하기 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 보안상 운영환경에서는 특정 도메인으로 제한 권장
    allow_methods=["*"],
    allow_headers=["*"],
)

# 클라이언트로부터 받을 재료 리스트의 형태를 정의 (데이터 유효성 검사)
class IngredientData(BaseModel):
    ingredients: list[str]

@app.post("/recommend/ingredients")
def recommend_by_ingredients(data: IngredientData):
    # 엔진에서 결과 리스트를 받아옴
    results = get_recommendations_by_ingredients(data.ingredients)
    
    # 🔍 서버 터미널에 상세 데이터 구조 출력
    print("--- [디버깅] 추천 엔진 반환값 확인 ---")
    for i, item in enumerate(results):
        print(f"Index {i}: {item}")
    print("-----------------------------------")
    
    return results