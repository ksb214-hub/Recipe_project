from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # CORS 허용을 위해 필수
from pydantic import BaseModel
from recommender_engine import *

app = FastAPI()

# 프론트엔드와 통신하기 위해 CORS 설정 추가 (필수!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    # Main.js에서 보내는 데이터가 {ingredients: [...]} 형태라면:
    ingredients: list[str] 

# 2. 재료 검색을 위한 데이터 모델 (여기서 정의가 필요합니다!)
class IngredientData(BaseModel):
    ingredients: list[str]

@app.post("/recommend")
def recommend(data: InputData):
    # 예시: 재료 리스트를 합쳐서 엔진에 전달하거나 로직 수정 필요
    # 성빈님의 get_recommendations가 제목을 받는지 재료를 받는지 확인하세요!
    query = " ".join(data.ingredients)
    results = get_recommendations(query)
    # 리스트를 직접 반환해야 프론트엔드와 매칭이 쉽습니다.
    return [{"title": title} for title in results]


# main.py 추가 부분
# 수정 전
# return {"recommendations": results} 

# 수정 후: 이렇게 하면 res.data가 바로 배열이 됩니다.
@app.post("/recommend/ingredients")
def recommend_by_ingredients(data: IngredientData):
    results = get_recommendations_by_ingredients(data.ingredients)
    # results가 리스트라면 바로 반환
    return [{"title": title} for title in results]