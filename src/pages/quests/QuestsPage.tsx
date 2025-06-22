import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, Plus, Calendar, Award, Crown, Sword, CheckCircle2, Circle, Trophy, Trash2
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Quest } from '../../types';
import { toast } from 'react-toastify';

const tabs = [
  { id: 'Daily', name: 'Daily', icon: Target },
  { id: 'Weekly', name: 'Weekly', icon: Calendar },
  { id: 'Challenge', name: 'Challenge', icon: Award },
];

export function QuestsPage() {
  const [activeTab, setActiveTab] = useState<Quest['category']>('Daily');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { 
    profile, 
    quests, 
    skills, 
    achievements, 
    titles, 
    completeQuest,
    deleteQuest
  } = useUserStore();

  if (!profile) return null;

  const questsByCategory = quests.filter(q => q.category === activeTab);
  const activeQuests = questsByCategory.filter(q => !q.isComplete);
  const completedQuests = questsByCategory.filter(q => q.isComplete);

  const handleToggleQuest = async (questId: string, isComplete: boolean) => {
    if (!isComplete) {
      await completeQuest(questId);
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    try {
      await deleteQuest(questId);
      toast.success('Quest deleted successfully!');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete quest');
    }
  };

  const getRewardName = (rewardType: string, rewardId: string) => {
    if (rewardType === 'skill') {
      const skill = skills.find(s => s.id === rewardId);
      return skill?.name || 'Unknown Skill';
    } else if (rewardType === 'achievement') {
      const achievement = achievements.find(a => a.id === rewardId);
      return achievement?.name || 'Unknown Achievement';
    } else if (rewardType === 'title') {
      const title = titles.find(t => t.id === rewardId);
      return title?.name || 'Unknown Title';
    }
    return 'Unknown Reward';
  };

  const QuestCard = ({ quest }: { quest: Quest }) => (
    <Card key={quest.id} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <button
            onClick={() => handleToggleQuest(quest.id, quest.isComplete)}
            className="mt-1 text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            {quest.isComplete ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${
              quest.isComplete ? 'text-gray-400 line-through' : 'text-white'
            }`}>
              {quest.title}
            </h3>
            <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
            
            <div className="flex items-center space-x-4 text-sm mb-3">
              <div className="flex items-center text-yellow-500">
                <Target className="w-4 h-4 mr-1" />
                +{quest.expReward} EXP
              </div>
              
              <div className="flex items-center text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                Due: {new Date(quest.dueDate).toLocaleDateString()}
              </div>
            </div>

            {/* Quest Rewards */}
            {quest.rewards && quest.rewards.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Rewards:</h4>
                <div className="flex flex-wrap gap-2">
                  {quest.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        reward.rewardType === 'skill'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : reward.rewardType === 'achievement'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {reward.rewardType === 'skill' && <Sword className="w-3 h-3 mr-1" />}
                      {reward.rewardType === 'achievement' && <Trophy className="w-3 h-3 mr-1" />}
                      {reward.rewardType === 'title' && <Crown className="w-3 h-3 mr-1" />}
                      {getRewardName(reward.rewardType, reward.rewardId)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <div className="ml-4">
          {deleteConfirm === quest.id ? (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteQuest(quest.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteConfirm(quest.id)}
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quests</h1>
          <p className="text-gray-400">Complete quests to gain experience and unlock rewards</p>
        </div>
        <Link to="/app/quests/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Quest
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Quest['category'])}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Quest Lists */}
      <div className="space-y-6">
        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Active {activeTab} Quests ({activeQuests.length})
            </h2>
            <div className="space-y-4">
              {activeQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <QuestCard quest={quest} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Completed {activeTab} Quests ({completedQuests.length})
            </h2>
            <div className="space-y-4">
              {completedQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <QuestCard quest={quest} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {questsByCategory.length === 0 && (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No {activeTab} Quests Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first {activeTab.toLowerCase()} quest to start earning experience and unlocking rewards!
            </p>
            <Link to="/app/quests/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Quest
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}