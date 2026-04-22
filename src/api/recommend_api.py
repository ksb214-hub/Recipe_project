from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 사용자가 입력한 재료를 받는 객체
class InputData(BaseModel):
    ingredient: str

@app.post("/recommend")
def recommend(data: InputData):
    # 위에서 작성한 get_recommendations 로직 호출
    result = get_recommendations(data.ingredient)
    return {"recommendations": result.tolist()}