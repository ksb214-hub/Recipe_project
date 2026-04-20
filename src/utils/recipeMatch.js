/**
 * 냉장고 재료(다중 배열)와 레시피를 매칭하는 함수
 * @param {Array} recipes - 레시피 상세 데이터 배열
 * @param {Array} myIngredients - 사용자가 선택한 재료들 (string[])
 * @returns {Array} 매칭 정보가 포함된 레시피 배열
 */
export function matchRecipesWithIngredients(recipes, myIngredients) {
  // 1. 검색할 재료가 없으면 초기값 반환
  if (!myIngredients || myIngredients.length === 0) {
    return recipes.map(recipe => ({
      recipe,
      matchedCount: 0,
      totalCount: recipe.ingredients.length,
      matchPercentage: 0,
      missingIngredients: recipe.ingredients.map(ing => ing.name || ing.amount)
    }));
  }

  // 2. 검색 효율을 위해 재료를 소문자 Set으로 변환
  const myIngSet = new Set(myIngredients.map(ing => ing.toLowerCase().trim()));

  const matchedRecipes = recipes.map((recipe) => {
    let matchedCount = 0;
    const missingIngredients = [];
    const totalCount = recipe.ingredients.length;

    recipe.ingredients.forEach((ingredient) => {
      const rawName = (ingredient.name || ingredient.amount || "").toLowerCase();
      
      // 재료명 단순화 (예: "양파 1개" -> "양파")
      const cleanedName = rawName.replace(/[0-9]|개|g|ml|스푼|큰술/g, '').trim();

      // [핵심] 다중 매칭 로직: 사용자가 입력한 재료가 레시피 재료명에 포함되는지 확인
      // 예: "삼겹살"이 "냉동 삼겹살"에 포함되는지 체크
      const hasIngredient = Array.from(myIngSet).some((myIng) => 
        cleanedName.includes(myIng) || myIng.includes(cleanedName)
      );

      if (hasIngredient) {
        matchedCount++;
      } else {
        missingIngredients.push(cleanedName);
      }
    });

    const matchPercentage = Math.round((matchedCount / totalCount) * 100);

    return {
      recipe: { ...recipe, cookTime: recipe.time || "15분" },
      matchedCount,
      totalCount,
      matchPercentage,
      missingIngredients,
    };
  });

  // 3. 매칭률이 0보다 큰 레시피를 우선 정렬
  return matchedRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
}