// src/mocks/recipes.ts
import { Recipe } from '../api/model/recipe';

export const DUMMY_RECIPES: Recipe[] = [
  {
    id: 1,
    title: "편의점 꿀조합 '마크정식'",
    description: "스파게티 컵라면과 떡볶이의 치명적인 만남",
    ingredients: ["자이언트 떡볶이", "콕콕콕 스파게티", "스트링 치즈", "소시지"],
    difficulty: "EASY",
    cookingTime: 5
  },
  {
    id: 2,
    title: "자취생 필수 '간장계란밥'",
    description: "반찬 없을 때 최고, 버터 한 조각이 신의 한 수",
    ingredients: ["밥", "계란", "진간장", "참기름", "버터"],
    difficulty: "EASY",
    cookingTime: 3
  },
  {
    id: 3,
    title: "냉장고 파먹기 '스팸 김치볶음밥'",
    description: "잘 익은 김치와 스팸만 있으면 끝",
    ingredients: ["스팸", "김치", "찬밥", "굴소스", "대파"],
    difficulty: "NORMAL",
    cookingTime: 15
  }
];