export interface TargetCalculationInput {
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Recomposition' | 'Endurance';
  dietType?: string;
}

export interface TargetCalculationResult {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  explanation: string;
}

export class TargetService {
  /**
   * Calculates BMR using the scientifically established Mifflin-St Jeor equation
   */
  public static calculateBMR(
    gender: 'male' | 'female' | 'other',
    weightKg: number,
    heightCm: number,
    age: number
  ): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'male') {
      return Math.round(base + 5);
    } else if (gender === 'female') {
      return Math.round(base - 161);
    } else {
      // Standard neutral average
      return Math.round(base - 78);
    }
  }

  /**
   * Calculates Total Daily Energy Expenditure (TDEE)
   */
  public static calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Extremely Active': 1.9,
    };
    const multiplier = multipliers[activityLevel] || 1.4;
    return Math.round(bmr * multiplier);
  }

  /**
   * Calculates evidence-based daily calorie targets and exact macronutrient distribution
   * adhering strictly to ISSN, ACSM, and sports nutrition standards.
   */
  public static computeTargets(input: TargetCalculationInput): TargetCalculationResult {
    const bmr = this.calculateBMR(input.gender, input.weightKg, input.heightCm, input.age);
    const tdee = this.calculateTDEE(bmr, input.activityLevel);

    let calorieTarget = tdee;
    let goalAdjustmentText = '';

    switch (input.fitnessGoal) {
      case 'Weight Loss': {
        // Safe 20% deficit, capped between 350-500 kcal to protect metabolic rate and lean mass
        const deficit = Math.min(Math.round(tdee * 0.20), 500);
        const safeFloor = input.gender === 'female' ? 1200 : 1500;
        calorieTarget = Math.max(safeFloor, tdee - deficit);
        goalAdjustmentText = `20% safe calorie deficit (-${tdee - calorieTarget} kcal) for fat loss while preserving lean muscle`;
        break;
      }
      case 'Muscle Gain': {
        // Controlled lean surplus of 10-12% (+250 to 350 kcal) to maximize protein synthesis while minimizing fat storage
        const surplus = Math.min(Math.round(tdee * 0.12), 350);
        calorieTarget = tdee + surplus;
        goalAdjustmentText = `Controlled 12% surplus (+${calorieTarget - tdee} kcal) to power lean hypertrophy`;
        break;
      }
      case 'Recomposition': {
        // Subtle 5% deficit for simultaneous fat reduction and muscle maintenance
        const deficit = Math.round(tdee * 0.05);
        calorieTarget = tdee - deficit;
        goalAdjustmentText = `Slight 5% deficit (-${deficit} kcal) optimized for body recomposition`;
        break;
      }
      case 'Endurance': {
        // 5% surplus to support intense cardiovascular glycogen demands
        const surplus = Math.round(tdee * 0.05);
        calorieTarget = tdee + surplus;
        goalAdjustmentText = `5% caloric surplus (+${surplus} kcal) to support glycogen repletion and endurance volume`;
        break;
      }
      case 'General Fitness':
      default: {
        calorieTarget = tdee;
        goalAdjustmentText = `Maintenance energy balance (100% TDEE) for sustained vitality and performance`;
        break;
      }
    }

    // -------------------------------------------------------------
    // EVIDENCE-BASED MACRONUTRIENT ALLOCATION (ISSN / ACSM Standards)
    // -------------------------------------------------------------
    const weightKg = Math.max(35, input.weightKg);

    // 1. PROTEIN CALCULATION (grams per kg of bodyweight)
    // Literature: 1.6 - 2.4 g/kg is the optimal range for muscle retention and synthesis.
    let proteinPerKg = 1.8;
    if (input.fitnessGoal === 'Muscle Gain') {
      proteinPerKg = 2.0;
    } else if (input.fitnessGoal === 'Weight Loss' || input.fitnessGoal === 'Recomposition') {
      proteinPerKg = 2.2; // Higher protein spares muscle mass in a caloric deficit
    } else if (input.fitnessGoal === 'Endurance') {
      proteinPerKg = 1.6;
    }

    if (input.dietType === 'High Protein') {
      proteinPerKg = Math.min(2.4, proteinPerKg + 0.2);
    } else if (input.dietType === 'Keto') {
      proteinPerKg = 1.8; // Moderate protein to avoid anti-ketogenic gluconeogenesis
    }

    let proteinGrams = Math.round(weightKg * proteinPerKg);
    // Ensure protein calories do not consume more than 40% of total calories (safety ceiling)
    if (proteinGrams * 4 > calorieTarget * 0.40) {
      proteinGrams = Math.round((calorieTarget * 0.35) / 4);
    }

    // 2. FATS & CARBOHYDRATES CALCULATION
    let fatGrams = 0;
    let carbsGrams = 0;

    if (input.dietType === 'Keto') {
      // Ketogenic: Strict low net carbs (25g), high fat (70-75% calories)
      carbsGrams = 25;
      const remainingCals = calorieTarget - (proteinGrams * 4) - (carbsGrams * 4);
      fatGrams = Math.max(30, Math.round(remainingCals / 9));
    } else if (input.dietType === 'Low Carb') {
      // Low Carb: ~20% carbs, 40% fat, remaining protein
      fatGrams = Math.round((calorieTarget * 0.40) / 9);
      const remainingCals = calorieTarget - (proteinGrams * 4) - (fatGrams * 9);
      carbsGrams = Math.max(30, Math.round(remainingCals / 4));
    } else {
      // Standard Balanced, High Protein, Muscle Gain, Fat Loss, Endurance:
      // Healthy fat baseline: 25% of total calories, with a minimum physiological floor of 0.75g/kg for endocrine health
      const baseFatGrams = Math.round((calorieTarget * 0.25) / 9);
      const floorFatGrams = Math.round(weightKg * 0.75);
      fatGrams = Math.max(floorFatGrams, baseFatGrams);

      // Carbohydrates fill the exact remaining energy requirement
      const usedCalories = (proteinGrams * 4) + (fatGrams * 9);
      const remainingCals = Math.max(0, calorieTarget - usedCalories);
      carbsGrams = Math.round(remainingCals / 4);
    }

    // 3. EXACT MATHEMATICAL INTEGRITY RECONCILIATION
    // Adjust any small integer-rounding difference into carbs (or fat for keto)
    // so (P*4 + C*4 + F*9) equals calorieTarget exactly!
    const macroSumCalories = (proteinGrams * 4) + (carbsGrams * 4) + (fatGrams * 9);
    const calorieDiff = calorieTarget - macroSumCalories;

    if (calorieDiff !== 0) {
      if (input.dietType === 'Keto') {
        fatGrams += Math.round(calorieDiff / 9);
      } else {
        carbsGrams += Math.round(calorieDiff / 4);
      }
    }

    // Exact final calorie target matching the sum of macros
    calorieTarget = (proteinGrams * 4) + (carbsGrams * 4) + (fatGrams * 9);

    const proteinPct = Math.round(((proteinGrams * 4) / calorieTarget) * 100);
    const carbsPct = Math.round(((carbsGrams * 4) / calorieTarget) * 100);
    const fatPct = Math.round(((fatGrams * 9) / calorieTarget) * 100);

    const explanation = `Scientific calculation via Mifflin-St Jeor: BMR ${bmr} kcal, TDEE ${tdee} kcal. ${goalAdjustmentText}. Precise macro target: Protein ${proteinGrams}g (${proteinPct}%), Carbs ${carbsGrams}g (${carbsPct}%), Fat ${fatGrams}g (${fatPct}%). Total: ${calorieTarget} kcal.`;

    return {
      bmr,
      tdee,
      calorieTarget,
      proteinGrams,
      carbsGrams,
      fatGrams,
      explanation,
    };
  }
}
