import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sword, Brain, Zap, Heart, Sparkles, Target, 
  Trophy, Crown, Plus, TrendingUp, Calendar
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatCard } from '../../components/ui/StatCard';
import { getEXPProgress } from '../../utils/levelUtils';
import logo from '../../assets/logotext_poweredby_360w.png';

const statIcons = {
  strength: { icon: Sword, color: 'bg-red-500/20 text-red-400' },
  intelligence: { icon: Brain, color: 'bg-blue-500/20 text-blue-400' },
  agility: { icon: Zap, color: 'bg-green-500/20 text-green-400' },
  charisma: { icon: Heart, color: 'bg-pink-500/20 text-pink-400' },
  vitality: { icon: TrendingUp, color: 'bg-orange-500/20 text-orange-400' },
  mana: { icon: Sparkles, color: 'bg-purple-500/20 text-purple-400' },
};

export function DashboardPage() {
  const { 
    profile, quests, skills, achievements, titles, 
    skillChains, achievementChains, titleChains,
    allocateStatPoint 
  } = useUserStore();

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  const expProgress = getEXPProgress(profile.totalEXP ?? 0);
  const activeQuests = quests.filter(q => !q.isComplete);
  const completedQuests = quests.filter(q => q.isComplete);
  const recentAchievements = achievements.filter(a => a.isUnlocked).slice(-3);
  const activeTitle = titles.find(t => t.id === profile.activeTitleId);

  const handleAllocateStatPoint = async (stat: keyof typeof profile.stats) => {
    await allocateStatPoint(stat);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero Section */}
      <Card className="p-4 lg:p-8 flex justify-center">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-xl lg:text-3xl font-bold text-black">
                {profile.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex-1 text-center lg:text-center w-full">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{profile.name}</h1>
            {activeTitle && (
              <p className="text-xl lg:text-2xl text-purple-600 font-bold mb-4">
                {activeTitle.name}
              </p>
            )}

            <div className="flex flex-col items-center gap-2 lg:gap-4 mb-4">
              <div className="text-lg lg:text-xl text-yellow-500 font-semibold">
                Level {profile.level ?? 1}
              </div>
              <div className="w-full sm:max-w-xs mx-auto">
                <ProgressBar
                  current={expProgress.current}
                  max={expProgress.needed}
                  label="EXP Progress"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="text-sm lg:text-base text-gray-400">
              Total EXP: {(profile.totalEXP ?? 0).toLocaleString()}
              {profile.bonusStatPoints > 0 && (
                <span className="block sm:inline sm:ml-4 text-yellow-500">
                  • {profile.bonusStatPoints} bonus stat points available
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/app/quests/new">
              <Button size="sm" className="text-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Quest
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-xl lg:text-2xl font-bold text-white">Character Stats</h2>
          {profile.bonusStatPoints > 0 && (
            <div className="text-xs lg:text-sm text-yellow-500">
              Click + to allocate bonus points ({profile.bonusStatPoints} available)
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {Object.entries(profile.stats || {}).map(([stat, value]) => {
            const { icon, color } = statIcons[stat as keyof typeof statIcons];
            return (
              <div key={stat} className="relative">
                <StatCard
                  icon={icon}
                  label={stat.charAt(0).toUpperCase() + stat.slice(1)}
                  value={value ?? 0}
                  color={color}
                />
                {profile.bonusStatPoints > 0 && (
                  <button
                    onClick={() => handleAllocateStatPoint(stat as keyof typeof profile.stats)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center text-sm font-bold hover:bg-yellow-400 transition-colors"
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Link to="/app/quests">
          <Card className="p-4 lg:p-6 text-center hover:bg-gray-750 transition-colors cursor-pointer">
            <Target className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 mx-auto mb-2 lg:mb-3" />
            <h3 className="text-sm lg:text-lg font-semibold text-white mb-1 lg:mb-2">Quests</h3>
            <p className="text-xs lg:text-sm text-gray-400">
              {activeQuests.length} active, {completedQuests.length} completed
            </p>
          </Card>
        </Link>

        <Link to="/app/skills">
          <Card className="p-4 lg:p-6 text-center hover:bg-gray-750 transition-colors cursor-pointer">
            <Sword className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 mx-auto mb-2 lg:mb-3" />
            <h3 className="text-sm lg:text-lg font-semibold text-white mb-1 lg:mb-2">Skills</h3>
            <p className="text-xs lg:text-sm text-gray-400">
              {skills?.filter(s => s.isUnlocked).length ?? 0} unlocked
            </p>
          </Card>
        </Link>

        <Link to="/app/achievements">
          <Card className="p-4 lg:p-6 text-center hover:bg-gray-750 transition-colors cursor-pointer">
            <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 mx-auto mb-2 lg:mb-3" />
            <h3 className="text-sm lg:text-lg font-semibold text-white mb-1 lg:mb-2">Achievements</h3>
            <p className="text-xs lg:text-sm text-gray-400">
              {achievements?.filter(a => a.isUnlocked).length ?? 0} earned
            </p>
          </Card>
        </Link>

        <Link to="/app/titles">
          <Card className="p-4 lg:p-6 text-center hover:bg-gray-750 transition-colors cursor-pointer">
            <Crown className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 mx-auto mb-2 lg:mb-3" />
            <h3 className="text-sm lg:text-lg font-semibold text-white mb-1 lg:mb-2">Titles</h3>
            <p className="text-xs lg:text-sm text-gray-400">
              {titles?.filter(t => t.isUnlocked).length ?? 0} earned
            </p>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Active Quests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-white">Active Quests</h2>
            <Link to="/app/quests">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {activeQuests.slice(0, 3).map((quest) => (
              <Card key={quest.id} className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm lg:text-base truncate">{quest.title}</h3>
                    <p className="text-xs lg:text-sm text-gray-400">{quest.category}</p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-yellow-500 font-semibold text-sm lg:text-base">+{quest.expReward} EXP</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(quest.dueDate ?? '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {activeQuests.length === 0 && (
              <Card className="p-4 lg:p-6 text-center">
                <p className="text-gray-400 text-sm lg:text-base">No active quests</p>
                <Link to="/app/quests/new">
                  <Button size="sm" className="mt-2">Create Your First Quest</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-white">Recent Achievements</h2>
            <Link to="/app/achievements">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <Card key={achievement.id} className="p-3 lg:p-4">
                <div className="flex items-center">
                  <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm lg:text-base truncate">{achievement.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-400 truncate">{achievement.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(achievement.createdAt ?? '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {recentAchievements.length === 0 && (
              <Card className="p-4 lg:p-6 text-center">
                <p className="text-gray-400 text-sm lg:text-base">No achievements yet</p>
                <p className="text-xs lg:text-sm text-gray-500 mt-1">Complete quests to earn achievements!</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}