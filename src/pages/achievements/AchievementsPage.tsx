import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Plus, Target, Star, Trash2 } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AchievementChain, Achievement } from '../../types';
import { toast } from 'react-toastify';

const tierColors = {
  Bronze: 'border-orange-600 text-orange-400',
  Silver: 'border-gray-400 text-gray-300',
  Gold: 'border-yellow-500 text-yellow-400',
  Legendary: 'border-purple-500 text-purple-400',
};

export function AchievementsPage() {
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [showChainModal, setShowChainModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'chain' | 'achievement'; id: string } | null>(null);
  const [chainForm, setChainForm] = useState({ name: '', description: '', iconName: 'Trophy', color: 'yellow' });
  const [achievementForm, setAchievementForm] = useState({ 
    name: '', 
    description: '', 
    iconName: 'Trophy', 
    tier: 'Bronze' as Achievement['tier']
  });
  
  const { 
    profile, 
    achievementChains, 
    achievements,
    addAchievementChain, 
    addAchievementToChain,
    deleteAchievementChain,
    deleteAchievement
  } = useUserStore();

  if (!profile) return null;

  const currentChain = achievementChains.find(c => c.id === selectedChain);
  const chainAchievements = currentChain?.achievements || [];

  const handleCreateChain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAchievementChain(chainForm);
      setShowChainModal(false);
      setChainForm({ name: '', description: '', iconName: 'Trophy', color: 'yellow' });
      toast.success('Achievement chain created!');
    } catch (error) {
      toast.error('Failed to create achievement chain');
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChain) return;
    
    try {
      await addAchievementToChain({
        ...achievementForm,
        achievementChainId: selectedChain,
        orderIndex: chainAchievements.length,
        isUnlocked: false,
      });
      setShowAchievementModal(false);
      setAchievementForm({ name: '', description: '', iconName: 'Trophy', tier: 'Bronze' });
      toast.success('Achievement added to chain!');
    } catch (error) {
      toast.error('Failed to add achievement');
    }
  };

  const handleDeleteChain = async (chainId: string) => {
    try {
      await deleteAchievementChain(chainId);
      toast.success('Achievement chain deleted successfully!');
      setDeleteConfirm(null);
      if (selectedChain === chainId) {
        setSelectedChain(null);
      }
    } catch (error) {
      toast.error('Failed to delete achievement chain');
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      await deleteAchievement(achievementId);
      toast.success('Achievement deleted successfully!');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete achievement');
    }
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <Card className={`p-4 ${achievement.isUnlocked ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-600'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${achievement.isUnlocked ? 'text-yellow-400' : 'text-white'}`}>
          {achievement.name}
        </h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${tierColors[achievement.tier]}`}>
            {achievement.tier}
          </span>
          <div className={`w-3 h-3 rounded-full ${achievement.isUnlocked ? 'bg-yellow-400' : 'bg-gray-500'}`} />
          {deleteConfirm?.type === 'achievement' && deleteConfirm?.id === achievement.id ? (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
                className="text-xs px-2 py-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteAchievement(achievement.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
              >
                Delete
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteConfirm({ type: 'achievement', id: achievement.id })}
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white p-1"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-gray-400 text-sm">{achievement.description}</p>
      <div className="mt-2 text-xs text-gray-500">
        Order: {achievement.orderIndex + 1}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Custom Achievement Chains</h1>
          <p className="text-gray-400">Create your own achievement chains and unlock them through quests</p>
        </div>
        <Button onClick={() => setShowChainModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Achievement Chain
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievement Chains List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Achievement Chains</h2>
          <div className="space-y-3">
            {achievementChains.map((chain) => (
              <Card 
                key={chain.id} 
                className={`p-4 cursor-pointer transition-all ${
                  selectedChain === chain.id ? 'border-yellow-500 bg-yellow-500/10' : 'hover:bg-gray-750'
                }`}
                onClick={() => setSelectedChain(String(chain.id))}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{chain.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{chain.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{chain.achievements?.length || 0} achievements</span>
                      <span>{chain.achievements?.filter(a => a.isUnlocked).length || 0} unlocked</span>
                    </div>
                  </div>
                  <div className="ml-2">
                    {deleteConfirm?.type === 'chain' && deleteConfirm?.id === chain.id ? (
                      <div className="flex flex-col space-y-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(null);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChain(chain.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                        >
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ type: 'chain', id: chain.id });
                        }}
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {achievementChains.length === 0 && (
              <Card className="p-6 text-center">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No achievement chains yet</p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowChainModal(true)}
                >
                  Create Your First Chain
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Achievements in Selected Chain */}
        <div className="lg:col-span-2">
          {currentChain ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{currentChain.name}</h2>
                  <p className="text-gray-400 text-sm">{currentChain.description}</p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setShowAchievementModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Achievement
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chainAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
                
                {chainAchievements.length === 0 && (
                  <div className="col-span-full">
                    <Card className="p-8 text-center">
                      <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No achievements in this chain yet</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowAchievementModal(true)}
                      >
                        Add First Achievement
                      </Button>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select an Achievement Chain</h3>
              <p className="text-gray-400">Choose an achievement chain from the left to view and manage its achievements</p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Chain Modal */}
      {showChainModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Achievement Chain</h3>
            <form onSubmit={handleCreateChain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={chainForm.name}
                  onChange={(e) => setChainForm({ ...chainForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={chainForm.description}
                  onChange={(e) => setChainForm({ ...chainForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="secondary" onClick={() => setShowChainModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Chain</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Achievement to {currentChain?.name}</h3>
            <form onSubmit={handleCreateAchievement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={achievementForm.name}
                  onChange={(e) => setAchievementForm({ ...achievementForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tier</label>
                <select
                  value={achievementForm.tier}
                  onChange={(e) => setAchievementForm({ ...achievementForm, tier: e.target.value as Achievement['tier'] })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="secondary" onClick={() => setShowAchievementModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Achievement</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}