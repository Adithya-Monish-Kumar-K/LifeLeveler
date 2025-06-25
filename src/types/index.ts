export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  totalEXP: number;
  level: number;
  bonusStatPoints: number;
  activeTitleId?: string;
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
    charisma: number;
    vitality: number;
    mana: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "Daily" | "Weekly" | "Challenge";
  expReward: number;
  isComplete: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  rewards?: QuestReward[];
}

export interface QuestReward {
  id: string;
  questId: string;
  rewardType: 'skill' | 'achievement' | 'title';
  rewardId: string;
  createdAt: string;
}

export interface SkillChain {
  id: string;
  userId: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  createdAt: string;
  skills?: Skill[];
}

export interface Skill {
  id: string;
  userId: string;
  skillChainId: string;
  name: string;
  description: string;
  orderIndex: number;
  isUnlocked: boolean;
  iconName: string;
  createdAt: string;
}

export interface AchievementChain {
  id: string;
  userId: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  createdAt: string;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  userId: string;
  achievementChainId: string;
  name: string;
  description: string;
  orderIndex: number;
  isUnlocked: boolean;
  iconName: string;
  tier: "Bronze" | "Silver" | "Gold" | "Legendary";
  createdAt: string;
}

export interface TitleChain {
  id: string;
  userId: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  createdAt: string;
  titles?: Title[];
}

export interface Title {
  id: string;
  userId: string;
  titleChainId: string;
  name: string;
  description: string;
  orderIndex: number;
  isUnlocked: boolean;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  createdAt: string;
}

export interface LevelUpNotification {
  show: boolean;
  oldLevel: number;
  newLevel: number;
  bonusPointsAwarded: number;
  hasBeenShownFor: number;
}