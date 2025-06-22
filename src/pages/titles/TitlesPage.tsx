import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Plus, Star, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TitleChain, Title } from '../../types';
import { toast } from 'react-toastify';

const rarityColors = {
  Common: 'border-gray-500 text-gray-400',
  Rare: 'border-blue-500 text-blue-400',
  Epic: 'border-purple-500 text-purple-400',
  Legendary: 'border-yellow-500 text-yellow-400',
};

export function TitlesPage() {
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [showChainModal, setShowChainModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'chain' | 'title'; id: string } | null>(null);
  const [chainForm, setChainForm] = useState({ name: '', description: '', iconName: 'Crown', color: 'purple' });
  const [titleForm, setTitleForm] = useState({ 
    name: '', 
    description: '', 
    rarity: 'Common' as Title['rarity']
  });
  
  const { 
    profile, 
    titleChains, 
    titles,
    addTitleChain, 
    addTitleToChain,
    deleteTitleChain,
    deleteTitle,
    setActiveTitle
  } = useUserStore();

  if (!profile) return null;

  const currentChain = titleChains.find(c => c.id === selectedChain);
  const chainTitles = currentChain?.titles || [];
  const activeTitle = titles.find(t => t.id === profile.activeTitleId);

  const handleCreateChain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTitleChain(chainForm);
      setShowChainModal(false);
      setChainForm({ name: '', description: '', iconName: 'Crown', color: 'purple' });
      toast.success('Title chain created!');
    } catch (error) {
      toast.error('Failed to create title chain');
    }
  };

  const handleCreateTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChain) return;
    
    try {
      await addTitleToChain({
        ...titleForm,
        titleChainId: selectedChain,
        orderIndex: chainTitles.length,
        isUnlocked: false,
      });
      setShowTitleModal(false);
      setTitleForm({ name: '', description: '', rarity: 'Common' });
      toast.success('Title added to chain!');
    } catch (error) {
      toast.error('Failed to add title');
    }
  };

  const handleDeleteChain = async (chainId: string) => {
    try {
      await deleteTitleChain(chainId);
      toast.success('Title chain deleted successfully!');
      setDeleteConfirm(null);
      if (selectedChain === chainId) {
        setSelectedChain(null);
      }
    } catch (error) {
      toast.error('Failed to delete title chain');
    }
  };

  const handleDeleteTitle = async (titleId: string) => {
    try {
      await deleteTitle(titleId);
      toast.success('Title deleted successfully!');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete title');
    }
  };

  const handleSetActiveTitle = async (titleId: string | undefined) => {
    await setActiveTitle(titleId);
    toast.success(titleId ? 'Title activated!' : 'Title removed!');
  };

  const TitleCard = ({ title, isActive }: { title: Title; isActive: boolean }) => (
    <Card className={`p-4 ${title.isUnlocked ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-600'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${title.isUnlocked ? 'text-yellow-400' : 'text-white'}`}>
          {title.name}
        </h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${rarityColors[title.rarity]}`}>
            {title.rarity}
          </span>
          {title.isUnlocked && (
            <button
              onClick={() => handleSetActiveTitle(isActive ? undefined : title.id)}
              className="text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              {isActive ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
          )}
          <div className={`w-3 h-3 rounded-full ${title.isUnlocked ? 'bg-yellow-400' : 'bg-gray-500'}`} />
          {deleteConfirm?.type === 'title' && deleteConfirm?.id === title.id ? (
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
                onClick={() => handleDeleteTitle(title.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
              >
                Delete
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteConfirm({ type: 'title', id: title.id })}
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white p-1"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-gray-400 text-sm">{title.description}</p>
      <div className="mt-2 text-xs text-gray-500">
        Order: {title.orderIndex + 1}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Custom Title Chains</h1>
          <p className="text-gray-400">Create your own title chains and unlock them through quests</p>
        </div>
        <Button onClick={() => setShowChainModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Title Chain
        </Button>
      </div>

      {/* Active Title Display */}
      {activeTitle && (
        <Card className="p-4 lg:p-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Crown className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-yellow-400">Currently Active</h2>
                <p className="text-xl lg:text-2xl font-bold text-white">{activeTitle.name}</p>
                <p className="text-gray-300 text-sm lg:text-base">{activeTitle.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSetActiveTitle(undefined)}
            >
              Remove Active Title
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Title Chains List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Title Chains</h2>
          <div className="space-y-3">
            {titleChains.map((chain) => (
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
                      <span>{chain.titles?.length || 0} titles</span>
                      <span>{chain.titles?.filter(t => t.isUnlocked).length || 0} unlocked</span>
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
            
            {titleChains.length === 0 && (
              <Card className="p-6 text-center">
                <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No title chains yet</p>
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

        {/* Titles in Selected Chain */}
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
                  onClick={() => setShowTitleModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Title
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chainTitles.map((title) => (
                  <TitleCard 
                    key={title.id} 
                    title={title} 
                    isActive={title.id === profile.activeTitleId}
                  />
                ))}
                
                {chainTitles.length === 0 && (
                  <div className="col-span-full">
                    <Card className="p-8 text-center">
                      <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No titles in this chain yet</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowTitleModal(true)}
                      >
                        Add First Title
                      </Button>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Title Chain</h3>
              <p className="text-gray-400">Choose a title chain from the left to view and manage its titles</p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Chain Modal */}
      {showChainModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Title Chain</h3>
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

      {/* Create Title Modal */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Title to {currentChain?.name}</h3>
            <form onSubmit={handleCreateTitle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={titleForm.name}
                  onChange={(e) => setTitleForm({ ...titleForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={titleForm.description}
                  onChange={(e) => setTitleForm({ ...titleForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                <select
                  value={titleForm.rarity}
                  onChange={(e) => setTitleForm({ ...titleForm, rarity: e.target.value as Title['rarity'] })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="secondary" onClick={() => setShowTitleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Title</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}