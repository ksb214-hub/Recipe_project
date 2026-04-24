import pandas as pd # 데이터를 표(DataFrame) 형태로 관리하고 조작하기 위한 핵심 라이브러리
import json # 크롤링한 JSON 형식의 데이터 파일을 파이썬 객체로 불러오기 위해 사용
from sklearn.feature_extraction.text import TfidfVectorizer # 텍스트를 숫자로 된 벡터로 변환(TF-IDF 방식 적용)
from sklearn.metrics.pairwise import cosine_similarity # 숫자로 변환된 벡터들 사이의 유사도를 계산(코사인 각도 사용)
import os

# 현재 파일(recommender_engine.py)이 있는 위치(root)를 기준으로 'recipes3.js'를 찾습니다.
file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'recipes3.js')

# [데이터 로드 및 가공]
# 프로젝트 구조상 JS 모듈 형식으로 저장된 데이터를 파이썬에서 읽을 수 있게 처리
with open(file_path, 'r', encoding='utf-8') as f:    # JS의 'export const' 구문을 제거하여 순수 JSON 데이터만 추출
    content = f.read().replace('export const recipes3 = ', '').rstrip(';')
    data = json.loads(content)
    df = pd.DataFrame(data) # 분석을 위해 데이터를 표 형태로 변환

# [데이터 특징 추출]
# 카테고리와 재료 정보를 하나의 텍스트로 결합하여 '레시피의 특징'을 정의
def preprocess_recipe(row):
    # 재료 리스트(amount)에서 단위(g, T 등)를 제외하고 재료명만 추출하여 공백으로 연결
    ingredients = " ".join([item['amount'].split()[0] for item in row['ingredients']])
    return f"{row['category']} {ingredients}" # 예: "한식 마늘 진간장 올리브유..."

df['combined_features'] = df.apply(preprocess_recipe, axis=1)

# [벡터화 및 학습]
# TfidfVectorizer: 각 단어의 빈도와 전체 문서에서의 희소성을 고려해 가중치 부여 (중요한 재료 단어일수록 가중치 상승)
tfidf = TfidfVectorizer()
tfidf_matrix = tfidf.fit_transform(df['combined_features']) # 텍스트를 고차원 숫자 벡터로 변환

# [유사도 계산]
# 모든 레시피와 모든 레시피 사이의 유사도를 행렬 형태로 계산
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# [추천 실행]
# 특정 레시피와 가장 유사한 벡터를 가진 다른 레시피들을 추천
def get_recommendations(title, cosine_sim=cosine_sim):
    # 1. 검색 결과 필터링
    search_results = df[df['title'].str.contains(title)]
    
    # 2. 검색 결과가 있는지 확인 (방어 코드)
    if search_results.empty:
        return [] # 결과가 없으면 빈 리스트 반환
    
    # 3. 검색 결과가 있다면 인덱스 추출
    idx = search_results.index[0]
    
    # 4. 기존 로직 실행
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:6]
    
    recipe_indices = [i[0] for i in sim_scores]
    return df['title'].iloc[recipe_indices].tolist() # .tolist()를 붙여서 깔끔하게 반환

def get_recommendations_by_ingredients(user_ingredients):
    # 1. 재료 필터링 (정확한 매칭)
    def has_ingredients(ingredients_list, query_ingredients):
        # 데이터의 모든 'amount' 값을 하나의 문자열로 합침
        full_ingredients_text = " ".join([item.get('amount', '') for item in ingredients_list])
        # 사용자가 입력한 재료들이 그 문자열 안에 있는지 확인
        return any(query in full_ingredients_text for query in query_ingredients)

    # 2. 리스트 형태의 입력 처리
    if isinstance(user_ingredients, str):
        user_ingredients = [user_ingredients]

    # 3. 데이터프레임 필터링
    mask = df['ingredients'].apply(lambda x: has_ingredients(x, user_ingredients))
    filtered_df = df[mask]
    
    # 결과 확인용 로그 (데이터가 진짜 있는지 확인)
    print(f"검색된 레시피 수: {len(filtered_df)}")
    
    if filtered_df.empty:
        return []

    # 4. 필터링된 데이터셋으로 유사도 계산
    filtered_indices = filtered_df.index
    sub_matrix = tfidf_matrix[filtered_indices]
    
    query_vec = tfidf.transform([" ".join(user_ingredients)])
    sim_scores = cosine_similarity(query_vec, sub_matrix).flatten()
    
    # 5. 유사도 점수 계산 (Jaccard Similarity 사용 - 재료 중복도)
    recommendations = []
    user_set = set(user_ingredients)
    
    for idx, row in filtered_df.iterrows():
        recipe_ing_list = [item.get('amount', '') for item in row['ingredients']]
        
        # 얼마나 많은 사용자 재료를 포함하고 있는지 카운트
        match_count = sum(1 for u_ing in user_ingredients if any(u_ing in r_ing for r_ing in recipe_ing_list))
        
        # 점수 = (매칭된 재료 수 / 전체 입력 재료 수) * 100
        score = (match_count / len(user_ingredients)) * 100
        # 레시피에 포함된 전체 재료명들을 리스트로 추출
        recipe_ing_names = [item.get('amount', '') for item in row['ingredients']]
        
        # 얼마나 많은 사용자 재료를 포함하고 있는지 카운트
        match_count = sum(1 for u_ing in user_ingredients if any(u_ing in r_ing for r_ing in recipe_ing_list))
        
        score = (match_count / len(user_ingredients)) * 100
        
        recommendations.append({
            "title": row['title'],
            "score": round(score, 2),
            "ingredients": recipe_ing_names  # 재료 리스트 추가!
        })
        
    # 이제 점수 높은 순으로 정렬하면, 내 재료를 가장 많이 활용하는 레시피가 상단에 나옵니다!
    # 수정 제안: 점수가 같을 때를 대비한 2차 정렬
    # (score 내림차순, 그리고 원본 sim_scores 오름차순(또는 다른 기준))
    return sorted(recommendations, key=lambda x: (-x['score'], -x.get('tfidf_score', 0)))[:5]

# print(get_recommendations_by_ingredients("당근"))