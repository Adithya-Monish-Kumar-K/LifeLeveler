export function calculateLevelExponential(totalEXP: number): number {
  let level = 1;
  let expNeeded = 1000;
  let remainingExp = totalEXP;
  
  while (remainingExp >= expNeeded) {
    remainingExp -= expNeeded;
    level++;
    expNeeded *= 2; // Double the EXP needed for next level
  }
  
  return level;
}

export function getEXPForLevel(level: number): number {
  let totalExp = 0;
  let expNeeded = 1000;
  
  for (let i = 1; i < level; i++) {
    totalExp += expNeeded;
    expNeeded *= 2;
  }
  
  return totalExp;
}

export function getEXPForNextLevel(currentLevel: number): number {
  return Math.pow(2, currentLevel - 1) * 1000;
}

export function getEXPProgress(totalEXP: number): { current: number; needed: number; percentage: number } {
  const currentLevel = calculateLevelExponential(totalEXP);
  const expForCurrentLevel = getEXPForLevel(currentLevel);
  const expForNextLevel = getEXPForLevel(currentLevel + 1);
  const currentEXPInLevel = totalEXP - expForCurrentLevel;
  const expNeededInLevel = expForNextLevel - expForCurrentLevel;
  
  return {
    current: currentEXPInLevel,
    needed: expNeededInLevel,
    percentage: (currentEXPInLevel / expNeededInLevel) * 100
  };
}