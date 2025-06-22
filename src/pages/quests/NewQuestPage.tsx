import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Calendar, Plus, X, Sword, Trophy, Crown } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Quest, QuestReward } from '../../types';
import { toast } from 'react-toastify';

export function NewQuestPage() {
  const navigate = useNavigate();
  const { 
    addQuest, 
    skillChains, 
    achievementChains, 
    titleChains,
    skills,
    achievements,
    titles
  } = useUserStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Daily' as Quest['category'],
    expReward: 100,
    dueDate: new Date().toISOString().split('T')[0],
  });

  const [selectedRewards, setSelectedRewards] = useState<QuestReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'achievements' | 'titles'>('skills');

  const handleAddReward = (type: 'skill' | 'achievement' | 'title', id: string) => {
    // Check if reward is already added
    if (selectedRewards.some(r => r.rewardId === id)) {
      toast.error('This reward is already added');
      return;
    }

    const newReward: QuestReward = {
      id: `temp-${Date.now()}`,
      questId: '',
      rewardType: type,
      rewardId: id,
      createdAt: new Date().toISOString(),
    };
    setSelectedRewards([...selectedRewards, newReward]);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added as reward!`);
  };

  const handleRemoveReward = (index: number) => {
    setSelectedRewards(selectedRewards.filter((_, i) => i !== index));
  };

  const getRewardName = (reward: QuestReward) => {
    if (reward.rewardType === 'skill') {
      const skill = skills.find(s => s.id === reward.rewardId);
      return skill?.name || 'Unknown Skill';
    } else if (reward.rewardType === 'achievement') {
      const achievement = achievements.find(a => a.id === reward.rewardId);
      return achievement?.name || 'Unknown Achievement';
    } else if (reward.rewardType === 'title') {
      const title = titles.find(t => t.id === reward.rewardId);
      return title?.name || 'Unknown Title';
    }
    return 'Unknown Reward';
  };

  const getRewardChainName = (reward: QuestReward) => {
    if (reward.rewardType === 'skill') {
      const skill = skills.find(s => s.id === reward.rewardId);
      const chain = skillChains.find(c => c.id === skill?.skillChainId);
      return chain?.name || 'Unknown Chain';
    } else if (reward.rewardType === 'achievement') {
      const achievement = achievements.find(a => a.id === reward.rewardId);
      const chain = achievementChains.find(c => c.id === achievement?.achievementChainId);
      return chain?.name || 'Unknown Chain';
    } else if (reward.rewardType === 'title') {
      const title = titles.find(t => t.id === reward.rewardId);
      const chain = titleChains.find(c => c.id === title?.titleChainId);
      return chain?.name || 'Unknown Chain';
    }
    return 'Unknown Chain';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questData: Omit<Quest, 'id' | 'userId' | 'createdAt'> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        expReward: formData.expReward,
        isComplete: false,
        dueDate: formData.dueDate,
        rewards: selectedRewards,
      };

      await addQuest(questData);
      toast.success('Quest created successfully!');
      navigate('/app/quests');
    } catch (error) {
      toast.error('Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSkills = () => {
    return skillChains.map(chain => ({
      ...chain,
      skills: chain.skills?.filter(skill => !skill.isUnlocked) || []
    })).filter(chain => chain.skills.length > 0);
  };

  const getAvailableAchievements = () => {
    return achievementChains.map(chain => ({
      ...chain,
      achievements: chain.achievements?.filter(achievement => !achievement.isUnlocked) || []
    })).filter(chain => chain.achievements.length > 0);
  };

  const getAvailableTitles = () => {
    return titleChains.map(chain => ({
      ...chain,
      titles: chain.titles?.filter(title => !title.isUnlocked) || []
    })).filter(chain => chain.titles.length > 0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 lg:p-0">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/quests')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quests
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Create New Quest</h1>
          <p className="text-gray-400">Design a challenge and assign rewards to unlock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quest Form */}
        <Card className="p-6 lg:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Quest Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quest Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., Complete 30 minutes of exercise"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Describe what needs to be accomplished..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Quest['category'] })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Challenge">Challenge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                EXP Reward
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                <input
                  type="number"
                  value={formData.expReward}
                  onChange={(e) => setFormData({ ...formData, expReward: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/app/quests')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quest'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Rewards Section */}
        <div className="space-y-6">
          {/* Selected Rewards */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quest Rewards ({selectedRewards.length})</h3>
            {selectedRewards.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedRewards.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {reward.rewardType === 'skill' && <Sword className="w-4 h-4 text-blue-400" />}
                      {reward.rewardType === 'achievement' && <Trophy className="w-4 h-4 text-yellow-400" />}
                      {reward.rewardType === 'title' && <Crown className="w-4 h-4 text-purple-400" />}
                      <div>
                        <span className="text-white font-medium">{getRewardName(reward)}</span>
                        <div className="text-xs text-gray-400">
                          {getRewardChainName(reward)} • {reward.rewardType}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveReward(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">
                No rewards selected. Choose skills, achievements, or titles below to unlock when this quest is completed.
              </p>
            )}
          </Card>

          {/* Available Rewards */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Available Rewards</h3>
            
            {/* Tabs */}
            <div className="flex space-x-1 mb-4 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('skills')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'skills'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Sword className="w-4 h-4 inline mr-2" />
                Skills
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'achievements'
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Achievements
              </button>
              <button
                onClick={() => setActiveTab('titles')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'titles'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Titles
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {activeTab === 'skills' && (
                <>
                  {getAvailableSkills().map(chain => (
                    <div key={chain.id} className="border border-gray-600 rounded-lg p-3">
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <Sword className="w-4 h-4 mr-2 text-blue-400" />
                        {chain.name}
                      </h4>
                      <div className="space-y-2">
                        {chain.skills.map(skill => (
                          <button
                            key={skill.id}
                            onClick={() => handleAddReward('skill', skill.id)}
                            disabled={selectedRewards.some(r => r.rewardId === skill.id)}
                            className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-600 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div>
                              <span className="text-white">{skill.name}</span>
                              <div className="text-xs text-gray-400">{skill.description}</div>
                            </div>
                            <Plus className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {getAvailableSkills().length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      No unlockable skills available. Create skill chains and skills first.
                    </p>
                  )}
                </>
              )}

              {activeTab === 'achievements' && (
                <>
                  {getAvailableAchievements().map(chain => (
                    <div key={chain.id} className="border border-gray-600 rounded-lg p-3">
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                        {chain.name}
                      </h4>
                      <div className="space-y-2">
                        {chain.achievements.map(achievement => (
                          <button
                            key={achievement.id}
                            onClick={() => handleAddReward('achievement', achievement.id)}
                            disabled={selectedRewards.some(r => r.rewardId === achievement.id)}
                            className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-600 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div>
                              <span className="text-white">{achievement.name}</span>
                              <div className="text-xs text-gray-400">
                                {achievement.description} • {achievement.tier}
                              </div>
                            </div>
                            <Plus className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {getAvailableAchievements().length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      No unlockable achievements available. Create achievement chains and achievements first.
                    </p>
                  )}
                </>
              )}

              {activeTab === 'titles' && (
                <>
                  {getAvailableTitles().map(chain => (
                    <div key={chain.id} className="border border-gray-600 rounded-lg p-3">
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <Crown className="w-4 h-4 mr-2 text-purple-400" />
                        {chain.name}
                      </h4>
                      <div className="space-y-2">
                        {chain.titles.map(title => (
                          <button
                            key={title.id}
                            onClick={() => handleAddReward('title', title.id)}
                            disabled={selectedRewards.some(r => r.rewardId === title.id)}
                            className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-600 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div>
                              <span className="text-white">{title.name}</span>
                              <div className="text-xs text-gray-400">
                                {title.description} • {title.rarity}
                              </div>
                            </div>
                            <Plus className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {getAvailableTitles().length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      No unlockable titles available. Create title chains and titles first.
                    </p>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}