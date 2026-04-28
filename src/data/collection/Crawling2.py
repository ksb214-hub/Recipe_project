import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

def get_safe_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless") # 실제 수집 시에는 화면 안 뜨게 설정 권장
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--blink-settings=imagesEnabled=false")
    chrome_options.page_load_strategy = 'eager'
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
    
    # webdriver_manager를 사용하지 않을 경우 일반적인 설정
    driver = webdriver.Chrome(options=chrome_options)
    return driver

# 1. 대상 URL 접속
url = "https://www.10000recipe.com/recipe/6896175"
driver = get_safe_driver()

try:
    driver.get(url)
    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")

    # 2. 제목 추출
    title_tag = soup.select_one('#contents_area_full > div.view2_summary.st3 > h3')
    title = title_tag.get_text(strip=True) if title_tag else "제목 없음"

    # 3. 메인 썸네일 이미지 추출
    thumb_img_tag = soup.select_one('#main_thumbs')
    thumbnail_url = thumb_img_tag['src'] if thumb_img_tag else ""

    # 4. 재료 가공 추출
    ingredients_tags = soup.select("#divConfirmedMaterialArea > ul:nth-child(1) > li")
    ingredients = []
    for i, tag in enumerate(ingredients_tags, 1):
        raw_text = " ".join(tag.get_text(separator=' ', strip=True).split())
        raw_text = raw_text.replace("구매", "").strip()
        if raw_text and len(raw_text) > 1:
            ingredients.append({
                "ingredientId": i,
                "amount": raw_text
            })

    # 5. 조리 순서 가공 추출
    step_divs = soup.select('#obx_recipe_step_start .view_step_cont')
    steps = []
    for i, div in enumerate(step_divs, 1):
        desc = div.get_text(separator=' ', strip=True)
        # 광고 및 기타 텍스트 필터링
        if any(key in desc for key in ["관련 상품", "등록일", "저작자", "수정일"]) or not desc:
            continue
        
        img_tag = div.select_one("img")
        steps.append({
            "stepNo": i,
            "description": desc,
            "cookingImageUrl": img_tag['src'] if img_tag else ""
        })

    # 6. 최종 데이터를 딕셔너리 구조로 정리 (백엔드 DTO 규격)
    recipe_json_data = {
        "title": title,
        "description": f"{title}의 상세 레시피입니다.",
        "thumbnailImageUrl": thumbnail_url,
        "ingredients": ingredients,
        "steps": steps
    }

    # 7. JSON 형식으로 출력
    # indent=2: 보기 좋게 정렬, ensure_ascii=False: 한글 깨짐 방지
    final_output = json.dumps(recipe_json_data, indent=2, ensure_ascii=False)
    print(final_output)

    # (선택 사항) 결과를 파일로 저장하고 싶다면 아래 주석을 해제하세요.
    with open("recipe_result.json", "w", encoding="utf-8") as f:
        f.write(final_output)

finally:
    driver.quit()