/**
 * 냉장고 재료와 레시피를 매칭하는 함수
 * @param {Array} recipes - 레시피 상세 데이터 배열 (recipes2)
 * @param {Array} myIngredients - 내 냉장고 재료 이름 배열 (string[])
 * @returns {Array} 매칭 정보가 포함된 레시피 배열
 */
export function matchRecipesWithIngredients(recipes, myIngredients) {
  if (!myIngredients || myIngredients.length === 0) {
    return recipes.map(recipe => ({
      recipe,
      matchedCount: 0,
      totalCount: recipe.ingredients.length,
      matchPercentage: 0,
      missingIngredients: recipe.ingredients.map(ing => ing.amount)
    }));
  }

  const matchedRecipes = recipes.map((recipe) => {
    let matchedCount = 0;
    const missingIngredients = [];
    const totalCount = recipe.ingredients.length;

    // 각 레시피 재료를 냉장고 재료와 비교
    recipe.ingredients.forEach((ingredient) => {
      // ingredient.amount 또는 ingredient.name 등 데이터 구조에 맞춰 조정 필요
      const ingredientName = (ingredient.amount || ingredient.name || "").toLowerCase();
      
      // 냉장고에 해당 재료가 있는지 확인 (부분 매칭)
      const hasIngredient = myIngredients.some((myIng) => {
        const lowerMyIng = myIng.toLowerCase();
        return (
          ingredientName.includes(lowerMyIng) || 
          lowerMyIng.includes(ingredientName.split(" ")[0])
        );
      });

      if (hasIngredient) {
        matchedCount++;
      } else {
        // 재료명만 추출 시도 (예: "2개 양파" -> "양파")
        const parts = ingredientName.split(" ");
        const ingredientOnly = parts.length > 1 ? parts.slice(1).join(" ") : ingredientName;
        missingIngredients.push(ingredientOnly);
      }
    });

    const matchPercentage = Math.round((matchedCount / totalCount) * 100);

    return {
      recipe: {
        ...recipe,
        cookTime: recipe.time || "15분" // 카드 컴포넌트와 필드명 통일
      },
      matchedCount,
      totalCount,
      matchPercentage,
      missingIngredients,
    };
  });

  // 매칭률 높은 순으로 정렬
  return matchedRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
}