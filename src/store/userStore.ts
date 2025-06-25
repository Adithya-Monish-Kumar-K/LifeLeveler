import { create } from 'zustand';
import { 
  UserProfile, Quest, Skill, Achievement, Title, LevelUpNotification,
  SkillChain, AchievementChain, TitleChain, QuestReward
} from '../types';
import { supabase } from '../lib/supabase';
import { calculateLevelExponential } from '../utils/levelUtils';

interface UserState {
  profile: UserProfile | null;
  quests: Quest[];
  skillChains: SkillChain[];
  skills: Skill[];
  achievementChains: AchievementChain[];
  achievements: Achievement[];
  titleChains: TitleChain[];
  titles: Title[];
  loading: boolean;
  levelUpNotification: LevelUpNotification;
  
  // Profile actions
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  allocateStatPoint: (stat: keyof UserProfile['stats']) => Promise<void>;
  
  // Quest actions
  loadQuests: (userId: string) => Promise<void>;
  addQuest: (quest: Omit<Quest, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
  
  // Skill chain actions
  loadSkillChains: (userId: string) => Promise<void>;
  addSkillChain: (chain: Omit<SkillChain, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  addSkillToChain: (skill: Omit<Skill, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteSkillChain: (chainId: string) => Promise<void>;
  deleteSkill: (skillId: string) => Promise<void>;
  
  // Achievement chain actions
  loadAchievementChains: (userId: string) => Promise<void>;
  addAchievementChain: (chain: Omit<AchievementChain, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  addAchievementToChain: (achievement: Omit<Achievement, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteAchievementChain: (chainId: string) => Promise<void>;
  deleteAchievement: (achievementId: string) => Promise<void>;
  
  // Title chain actions
  loadTitleChains: (userId: string) => Promise<void>;
  addTitleChain: (chain: Omit<TitleChain, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  addTitleToChain: (title: Omit<Title, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteTitleChain: (chainId: string) => Promise<void>;
  deleteTitle: (titleId: string) => Promise<void>;
  
  // Reward actions
  setActiveTitle: (titleId: string | undefined) => Promise<void>;
  
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  quests: [],
  skillChains: [],
  skills: [],
  achievementChains: [],
  achievements: [],
  titleChains: [],
  titles: [],
  loading: false,
  levelUpNotification: { show: false, oldLevel: 0, newLevel: 0, bonusPointsAwarded: 0 },

  loadProfile: async (userId: string) => {
    set({ loading: true });
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading profile:', error);
      set({ loading: false });
      return;
    }
    
    if (!data) {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const newProfile = {
          id: userId,
          name: user.user.user_metadata?.name || user.user.email?.split('@')[0] || 'Adventurer',
          email: user.user.email || '',
          total_exp: 0,
          level: 1,
          bonus_stat_points: 0,
          stats: {
            strength: 1,
            intelligence: 1,
            agility: 1,
            charisma: 1,
            vitality: 1,
            mana: 1,
          },
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          set({ loading: false });
          return;
        }
        
        const profile: UserProfile = {
          id: createdProfile.id,
          name: createdProfile.name,
          email: createdProfile.email,
          avatarUrl: createdProfile.avatar_url,
          totalEXP: createdProfile.total_exp,
          level: createdProfile.level,
          bonusStatPoints: createdProfile.bonus_stat_points,
          activeTitleId: createdProfile.active_title_id,
          stats: createdProfile.stats,
          createdAt: createdProfile.created_at,
          updatedAt: createdProfile.updated_at,
        };
        
        set({ profile, loading: false });
        await get().loadQuests(userId);
        await get().loadSkillChains(userId);
        await get().loadAchievementChains(userId);
        await get().loadTitleChains(userId);
        return;
      }
    }
    
    const profile: UserProfile = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      totalEXP: data.total_exp,
      level: data.level,
      bonusStatPoints: data.bonus_stat_points || 0,
      activeTitleId: data.active_title_id,
      stats: data.stats,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    set({ profile, loading: false });
    await get().loadQuests(userId);
    await get().loadSkillChains(userId);
    await get().loadAchievementChains(userId);
    await get().loadTitleChains(userId);
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { profile } = get();
    if (!profile) return;
    
    const dbUpdates: any = {};
    if (updates.name !== undefined)  dbUpdates.name  = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.totalEXP !== undefined) dbUpdates.total_exp = updates.totalEXP;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.bonusStatPoints !== undefined) dbUpdates.bonus_stat_points = updates.bonusStatPoints;
    if (updates.activeTitleId !== undefined) dbUpdates.active_title_id = updates.activeTitleId;
    if (updates.stats !== undefined) dbUpdates.stats = updates.stats;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', profile.id);
    
    if (error) {
      console.error('Error updating profile:', error);
      return;
    }
    
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    set({ profile: updatedProfile });
  },

  allocateStatPoint: async (stat: keyof UserProfile['stats']) => {
    const { profile } = get();
    if (!profile || profile.bonusStatPoints <= 0) return;
    
    const newStats = { ...profile.stats };
    newStats[stat] += 1;
    
    await get().updateProfile({
      stats: newStats,
      bonusStatPoints: profile.bonusStatPoints - 1,
    });
  },

  loadQuests: async (userId: string) => {
    const { data: questsData } = await supabase
      .from('quests')
      .select(`
        *,
        quest_rewards (
          id,
          reward_type,
          reward_id,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const quests: Quest[] = (questsData || []).map(q => ({
      id: q.id,
      userId: q.user_id,
      title: q.title,
      description: q.description,
      category: q.category,
      expReward: q.exp_reward,
      isComplete: q.is_complete,
      dueDate: q.due_date,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      rewards: q.quest_rewards?.map((r: any) => ({
        id: r.id,
        questId: q.id,
        rewardType: r.reward_type,
        rewardId: r.reward_id,
        createdAt: r.created_at,
      })) || [],
    }));

    set({ quests });
  },

  addQuest: async (questData: Omit<Quest, 'id' | 'userId' | 'createdAt'>) => {
    const { profile } = get();
    if (!profile) return;
    
    const { data, error } = await supabase
      .from('quests')
      .insert({
        user_id: profile.id,
        title: questData.title,
        description: questData.description,
        category: questData.category,
        exp_reward: questData.expReward,
        is_complete: questData.isComplete,
        due_date: questData.dueDate,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding quest:', error);
      throw error;
    }

    // Add quest rewards if any
    if (questData.rewards && questData.rewards.length > 0) {
      const rewardInserts = questData.rewards.map(reward => ({
        quest_id: data.id,
        reward_type: reward.rewardType,
        reward_id: reward.rewardId,
      }));

      const { error: rewardError } = await supabase
        .from('quest_rewards')
        .insert(rewardInserts);
      
      if (rewardError) {
        console.error('Error adding quest rewards:', rewardError);
        throw rewardError;
      }
    }
    
    await get().loadQuests(profile.id);
  },

  deleteQuest: async (questId: string) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId)
      .eq('user_id', profile.id);
    
    if (error) {
      console.error('Error deleting quest:', error);
      throw error;
    }
    
    await get().loadQuests(profile.id);
  },

  completeQuest: async (questId: string) => {
    const { profile, quests } = get();
    if (!profile) return;
    
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.isComplete) return;
    
    const oldLevel = profile.level;
    const newTotalEXP = profile.totalEXP + quest.expReward;
    const newLevel = calculateLevelExponential(newTotalEXP);
    const bonusPointsAwarded = newLevel > oldLevel ? (newLevel - oldLevel) * 3 : 0;
    
    // Update quest in database
    const { error: questError } = await supabase
      .from('quests')
      .update({ is_complete: true, updated_at: new Date().toISOString() })
      .eq('id', questId);
    
    if (questError) {
      console.error('Error updating quest:', questError);
      return;
    }

    // Unlock quest rewards
    if (quest.rewards && quest.rewards.length > 0) {
      for (const reward of quest.rewards) {
        if (reward.rewardType === 'skill') {
          await supabase
            .from('skills')
            .update({ is_unlocked: true })
            .eq('id', reward.rewardId);
        } else if (reward.rewardType === 'achievement') {
          await supabase
            .from('achievements')
            .update({ is_unlocked: true })
            .eq('id', reward.rewardId);
        } else if (reward.rewardType === 'title') {
          await supabase
            .from('titles')
            .update({ is_unlocked: true })
            .eq('id', reward.rewardId);
        }
      }
    }
    
    // Update profile
    await get().updateProfile({
      totalEXP: newTotalEXP,
      level: newLevel,
    });
    
    // Reload data
    await get().loadQuests(profile.id);
    await get().loadSkillChains(profile.id);
    await get().loadAchievementChains(profile.id);
    await get().loadTitleChains(profile.id);
    
    // Show level up notification if leveled up
    if (newLevel > oldLevel) {
      get().showLevelUp(oldLevel, newLevel, bonusPointsAwarded);
    }
  },

  loadSkillChains: async (userId: string) => {
    const { data: chainsData } = await supabase
      .from('skill_chains')
      .select(`
        *,
        skills (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    const skillChains: SkillChain[] = (chainsData || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      description: c.description,
      iconName: c.icon_name,
      color: c.color,
      createdAt: c.created_at,
      skills: c.skills?.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        skillChainId: s.skill_chain_id,
        name: s.name,
        description: s.description,
        orderIndex: s.order_index,
        isUnlocked: s.is_unlocked,
        iconName: s.icon_name,
        createdAt: s.created_at,
      })).sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [],
    }));

    const skills = skillChains.flatMap(chain => chain.skills || []);
    set({ skillChains, skills });
  },

  addSkillChain: async (chainData: Omit<SkillChain, 'id' | 'userId' | 'createdAt'>) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('skill_chains')
      .insert({
        user_id: profile.id,
        name: chainData.name,
        description: chainData.description,
        icon_name: chainData.iconName || 'Target',
        color: chainData.color || 'blue',
      });
    
    if (error) {
      console.error('Error adding skill chain:', error);
      throw error;
    }
    
    await get().loadSkillChains(profile.id);
  },

  deleteSkillChain: async (chainId: string) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('skill_chains')
      .delete()
      .eq('id', chainId)
      .eq('user_id', profile.id);
    
    if (error) {
      console.error('Error deleting skill chain:', error);
      throw error;
    }
    
    await get().loadSkillChains(profile.id);
  },

  addSkillToChain: async (skillData: Omit<Skill, 'id' | 'userId' | 'createdAt'>) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('skills')
      .insert({
        user_id: profile.id,
        skill_chain_id: skillData.skillChainId,
        name: skillData.name,
        description: skillData.description,
        order_index: skillData.orderIndex,
        is_unlocked: skillData.isUnlocked || false,
        icon_name: skillData.iconName || 'Target',
      });
    
    if (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
    
    await get().loadSkillChains(profile.id);
  },

  deleteSkill: async (skillId: string) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', profile.id);
    
    if (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
    
    await get().loadSkillChains(profile.id);
  },

  loadAchievementChains: async (userId: string) => {
    const { data: chainsData } = await supabase
      .from('achievement_chains')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    const achievementChains: AchievementChain[] = (chainsData || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      description: c.description,
      iconName: c.icon_name,
      color: c.color,
      createdAt: c.created_at,
      achievements: c.achievements?.map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        achievementChainId: a.achievement_chain_id,
        name: a.name,
        description: a.description,
        orderIndex: a.order_index,
        isUnlocked: a.is_unlocked,
        iconName: a.icon_name,
        tier: a.tier,
        createdAt: a.created_at,
      })).sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [],
    }));

    const achievements = achievementChains.flatMap(chain => chain.achievements || []);
    set({ achievementChains, achievements });
  },

  addAchievementChain: async (chainData: Omit<AchievementChain, 'id' | 'userId' | 'createdAt'>) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('achievement_chains')
      .insert({
        user_id: profile.id,
        name: chainData.name,
        description: chainData.description,
        icon_name: chainData.iconName || 'Trophy',
        color: chainData.color || 'yellow',
      });
    
    if (error) {
      console.error('Error adding achievement chain:', error);
      throw error;
    }
    
    await get().loadAchievementChains(profile.id);
  },

  deleteAchievementChain: async (chainId: string) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('achievement_chains')
      .delete()
      .eq('id', chainId)
      .eq('user_id', profile.id);
    
    if (error) {
      console.error('Error deleting achievement chain:', error);
      throw error;
    }
    
    await get().loadAchievementChains(profile.id);
  },

  addAchievementToChain: async (achievementData: Omit<Achievement, 'id' | 'userId' | 'createdAt'>) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('achievements')
      .insert({
        user_id: profile.id,
        achievement_chain_id: achievementData.achievementChainId,
        name: achievementData.name,
        description: achievementData.description,
        order_index: achievementData.orderIndex,
        is_unlocked: achievementData.isUnlocked || false,
        icon_name: achievementData.iconName || 'Trophy',
        tier: achievementData.tier,
      });
    
    if (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
    
    await get().loadAchievementChains(profile.id);
  },

  deleteAchievement: async (achievementId: string) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', achievementId)
      .eq('user_id', profile.id);
    
    if (error) {
      console.error('Error deleting achievement:', error);
      throw error;
    }
    
    await get().loadAchievementChains(profile.id);
  },

  loadTitleChains: async (userId: string) => {
    const { data: chainsData } = await supabase
      .from('title_chains')
      .select(`
        *,
        titles (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    const titleChains: TitleChain[] = (chainsData || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      description: c.description,
      iconName: c.icon_name,
      color: c.color,
      createdAt: c.created_at,
      titles: c.titles?.map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        titleChainId: t.title_chain_id,
        name: t.name,
        description: t.description,
        orderIndex: t.order_index,
        isUnlocked: t.is_unlocked,
        rarity: t.rarity,
        createdAt: t.created_at,
      })).sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [],
    }));

    const titles = titleChains.flatMap(chain => chain.titles || []);
    set({ titleChains, titles });
  },

  addTitleChain: async (chainData: Omit<TitleChain, 'id' | 'userId' | 'createdAt'>) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('title_chains')
      .insert({
        user_id: profile.id,
        name: chainData.name,
        description: chainData.description,
        icon_name: chainData.iconName || 'Crown',
        color: chainData.color || 'purple',
      });
    
    if (error) {
      console.error('Error adding title chain:', error);
      throw error;
    }
    
    await get().loadTitleChains(profile.id);
  },

  deleteTitleChain: async (chainId: string) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('title_chains')
      .delete()
      .eq('id', chainId)
      .eq('user_id', profile.id);
    
    if (error) {
      console.error('Error deleting title chain:', error);
      throw error;
    }
    
    await get().loadTitleChains(profile.id);
  },

  addTitleToChain: async (titleData: Omit<Title, 'id' | 'userId' | 'createdAt'>) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('titles')
      .insert({
        user_id: profile.id,
        title_chain_id: titleData.titleChainId,
        name: titleData.name,
        description: titleData.description,
        order_index: titleData.orderIndex,
        is_unlocked: titleData.isUnlocked || false,
        rarity: titleData.rarity,
      });
    
    if (error) {
      console.error('Error adding title:', error);
      throw error;
    }
    
    await get().loadTitleChains(profile.id);
  },

  deleteTitle: async (titleId: string) => {
    const { profile } = get();
    if (!profile) return;
    
    const { error } = await supabase
      .from('titles')
      .delete()
      .eq('id', titleId)
      .eq('user_id', profile.id);
    
    if (error) {
      console.error('Error deleting title:', error);
      throw error;
    }
    
    await get().loadTitleChains(profile.id);
  },

  setActiveTitle: async (titleId: string | undefined) => {
    await get().updateProfile({ activeTitleId: titleId });
  },

  showLevelUp: (oldLevel: number, newLevel: number, bonusPoints: number) => {
    set({ levelUpNotification: { show: true, oldLevel, newLevel, bonusPointsAwarded: bonusPoints } });
  },

    hideLevelUp: () =>
    set(state => ({
      levelUpNotification: {
        ...state.levelUpNotification,
        show: false,
      },
    })),
  
  updateUsername: async (newName: string) => {
  const { profile } = get();
  if (!profile) return;
  // call your generic updater
  await get().updateProfile({ name: newName });
},
  
  resetCharacter: async (): Promise<void> => {
  const { profile } = get();
  if (!profile) return;

  const userId = profile.id;

  // 1) Load all quest IDs for this user
  const { data: userQuests, error: questLoadError } = await supabase
    .from<{ id: string }>('quests')
    .select('id')
    .eq('user_id', userId);

  if (questLoadError) {
    console.error('Error loading quests for reset:', questLoadError);
    return;
  }

  const questIds: string[] = (userQuests ?? []).map(q => q.id);

  // 2) Delete all quest_rewards for those quests
  if (questIds.length > 0) {
    const { error: rewardDeleteError } = await supabase
      .from('quest_rewards')
      .delete()
      .in('quest_id', questIds);

    if (rewardDeleteError) {
      console.error('Error deleting quest rewards:', rewardDeleteError);
      return;
    }
  }

  // 3) Delete all quests
  const { error: questDeleteError } = await supabase
    .from('quests')
    .delete()
    .eq('user_id', userId);

  if (questDeleteError) {
    console.error('Error deleting quests:', questDeleteError);
    return;
  }

  // 4) Delete all skills and their chains
  await supabase.from('skills').delete().eq('user_id', userId);
  await supabase.from('skill_chains').delete().eq('user_id', userId);

  // 5) Delete all achievements and their chains
  await supabase.from('achievements').delete().eq('user_id', userId);
  await supabase.from('achievement_chains').delete().eq('user_id', userId);

  // 6) Delete all titles and their chains
  await supabase.from('titles').delete().eq('user_id', userId);
  await supabase.from('title_chains').delete().eq('user_id', userId);

  // 7) Reset the profile record itself
  const resetPayload: Partial<UserProfile> = {
    totalEXP: 0,
    level: 1,
    bonusStatPoints: 0,
    stats: {
      strength: 1,
      intelligence: 1,
      agility: 1,
      charisma: 1,
      vitality: 1,
      mana: 1,
    },
    activeTitleId: undefined,
  };
  await get().updateProfile(resetPayload);

  // 8) Reload all in-memory state
  await get().loadProfile(userId);
},
}));