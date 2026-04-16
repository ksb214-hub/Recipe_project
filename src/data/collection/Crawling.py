import time
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor

def get_safe_driver():
    chrome_options = Options()
    # chrome_options.add_argument("--headless") # 실제 구동 시에는 Headless 권장
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--blink-settings=imagesEnabled=false")
    chrome_options.page_load_strategy = 'eager'
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

class RecipeCrawler:
    def __init__(self, save_path="./src/data/recipes2.js"):
        self.save_path = save_path

    def fetch_detail_worker(self, title, url, thumbnail):
        worker_driver = None
        try:
            worker_driver = get_safe_driver()
            worker_driver.get(url)
            time.sleep(2)
            soup = BeautifulSoup(worker_driver.page_source, 'html.parser')
            
            # ✅ 1. 재료 가공: 리스트 내에서 빈 값이나 불필요한 텍스트 제거
            ingredients_tags = soup.select("#divConfirmedMaterialArea > ul:nth-child(1) > li")
            ingredients = []
            for i, tag in enumerate(ingredients_tags, 1):
                # 텍스트 내의 모든 연속된 공백을 하나로 줄이고 앞뒤 공백 제거
                raw_text = " ".join(tag.get_text(separator=' ', strip=True).split())
                raw_text = raw_text.replace("구매", "").strip()
                
                if raw_text and len(raw_text) > 1: # 한 글자짜리 쓰레기 데이터 방지
                    ingredients.append({
                        "ingredientId": i,
                        "amount": raw_text
                    })
            
            # ✅ 2. 조리 순서 가공: 레시피 내용만 정확히 추출
            step_divs = soup.select('#obx_recipe_step_start .view_step_cont')
            steps = []
            for i, div in enumerate(step_divs, 1):
                # 텍스트 추출 및 정제
                desc = div.get_text(separator=' ', strip=True)
                # "관련 상품"이나 "등록일" 같은 텍스트가 포함된 div는 제외하는 방어 로직
                if "관련 상품" in desc or "등록일" in desc or not desc:
                    continue
                    
                img_tag = div.select_one("img")
                steps.append({
                    "stepNo": i,
                    "description": desc,
                    "cookingImageUrl": img_tag['src'] if img_tag else ""
                })

            return {
                "title": title,
                "description": f"{title}의 핵심 레시피입니다.",
                "thumbnailImageUrl": thumbnail,
                "ingredients": ingredients,
                "steps": steps
            }
        except Exception as e:
            print(f"❌ 가공 중 에러 발생 [{title}]: {e}")
            return None
        
    def run(self):
        print("🚀 [Step 1] 메인 랭킹 페이지 분석...")
        main_driver = get_safe_driver()
        base_data = []

        try:
            main_driver.get("https://www.10000recipe.com/ranking/home_new.html")
            time.sleep(3)
            soup = BeautifulSoup(main_driver.page_source, 'html.parser')
            items = soup.select("#contents_area_full > div > ul.common_sp_list_ul.ea4 > li")[:10]
            
            for item in items:
                title_tag = item.select_one(".common_sp_caption_tit")
                link_tag = item.select_one(".common_sp_thumb > a")
                img_tag = item.select_one(".common_sp_thumb > a > img")
                
                if title_tag and link_tag:
                    base_data.append((
                        title_tag.get_text(strip=True),
                        "https://www.10000recipe.com" + link_tag['href'],
                        img_tag['src'] if img_tag else ""
                    ))
        finally:
            main_driver.quit()

        if base_data:
            # ✅ 자원 소모를 줄이기 위해 max_workers=2로 설정 (안정성 최우선)
            print(f"🚀 [Step 2] 상세 페이지 병렬 수집 시작 (Thread: 2)...")
            with ThreadPoolExecutor(max_workers=2) as executor:
                results = list(executor.map(lambda x: self.fetch_detail_worker(x[0], x[1], x[2]), base_data))
                final_results = [r for r in results if r]

            # ✅ [Step 3] JS 파일 저장
            os.makedirs(os.path.dirname(self.save_path), exist_ok=True)
            js_content = f"export const recipes2 = {json.dumps(final_results, indent=2, ensure_ascii=False)};"
            with open(self.save_path, "w", encoding="utf-8") as f:
                f.write(js_content)
            
            print(f"\n✨ [완료] {len(final_results)}개의 레시피 데이터가 {self.save_path}에 저장되었습니다!")

if __name__ == "__main__":
    crawler = RecipeCrawler()
    crawler.run()