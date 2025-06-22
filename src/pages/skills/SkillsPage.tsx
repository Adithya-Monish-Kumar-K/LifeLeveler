import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Plus, Target, Trash2 } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkillChain, Skill } from '../../types';
import { toast } from 'react-toastify';

export function SkillsPage() {
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [showChainModal, setShowChainModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'chain' | 'skill'; id: string } | null>(null);
  const [chainForm, setChainForm] = useState({ name: '', description: '', iconName: 'Target', color: 'blue' });
  const [skillForm, setSkillForm] = useState({ name: '', description: '', iconName: 'Target' });
  
  const { 
    profile, 
    skillChains, 
    skills,
    addSkillChain, 
    addSkillToChain,
    deleteSkillChain,
    deleteSkill
  } = useUserStore();

  if (!profile) return null;

  const currentChain = skillChains.find(c => c.id === selectedChain);
  const chainSkills = currentChain?.skills || [];

  const handleCreateChain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSkillChain(chainForm);
      setShowChainModal(false);
      setChainForm({ name: '', description: '', iconName: 'Target', color: 'blue' });
      toast.success('Skill chain created!');
    } catch (error) {
      toast.error('Failed to create skill chain');
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChain) return;
    
    try {
      await addSkillToChain({
        ...skillForm,
        skillChainId: selectedChain,
        orderIndex: chainSkills.length,
        isUnlocked: false,
      });
      setShowSkillModal(false);
      setSkillForm({ name: '', description: '', iconName: 'Target' });
      toast.success('Skill added to chain!');
    } catch (error) {
      toast.error('Failed to add skill');
    }
  };

  const handleDeleteChain = async (chainId: string) => {
    try {
      await deleteSkillChain(chainId);
      toast.success('Skill chain deleted successfully!');
      setDeleteConfirm(null);
      if (selectedChain === chainId) {
        setSelectedChain(null);
      }
    } catch (error) {
      toast.error('Failed to delete skill chain');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await deleteSkill(skillId);
      toast.success('Skill deleted successfully!');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const SkillCard = ({ skill }: { skill: Skill }) => (
    <Card className={`p-4 ${skill.isUnlocked ? 'border-green-500 bg-green-500/10' : 'border-gray-600'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${skill.isUnlocked ? 'text-green-400' : 'text-white'}`}>
          {skill.name}
        </h4>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${skill.isUnlocked ? 'bg-green-400' : 'bg-gray-500'}`} />
          {deleteConfirm?.type === 'skill' && deleteConfirm?.id === skill.id ? (
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
                onClick={() => handleDeleteSkill(skill.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
              >
                Delete
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteConfirm({ type: 'skill', id: skill.id })}
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white p-1"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-gray-400 text-sm">{skill.description}</p>
      <div className="mt-2 text-xs text-gray-500">
        Order: {skill.orderIndex + 1}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Custom Skill Trees</h1>
          <p className="text-gray-400">Create your own skill chains and unlock them through quests</p>
        </div>
        <Button onClick={() => setShowChainModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Skill Chain
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Chains List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Skill Chains</h2>
          <div className="space-y-3">
            {skillChains.map((chain) => (
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
                      <span>{chain.skills?.length || 0} skills</span>
                      <span>{chain.skills?.filter(s => s.isUnlocked).length || 0} unlocked</span>
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
            
            {skillChains.length === 0 && (
              <Card className="p-6 text-center">
                <Sword className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No skill chains yet</p>
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

        {/* Skills in Selected Chain */}
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
                  onClick={() => setShowSkillModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chainSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
                
                {chainSkills.length === 0 && (
                  <div className="col-span-full">
                    <Card className="p-8 text-center">
                      <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No skills in this chain yet</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowSkillModal(true)}
                      >
                        Add First Skill
                      </Button>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Sword className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Skill Chain</h3>
              <p className="text-gray-400">Choose a skill chain from the left to view and manage its skills</p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Chain Modal */}
      {showChainModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Skill Chain</h3>
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

      {/* Create Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Skill to {currentChain?.name}</h3>
            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={skillForm.description}
                  onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="secondary" onClick={() => setShowSkillModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Skill</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}