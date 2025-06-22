import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Plus } from 'lucide-react';
import { Button } from './Button';

interface LevelUpModalProps {
  show: boolean;
  oldLevel: number;
  newLevel: number;
  bonusPointsAwarded: number;
  onClose: () => void;
}

export function LevelUpModal({ show, oldLevel, newLevel, bonusPointsAwarded, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500 rounded-2xl p-8 text-center max-w-md w-full relative overflow-hidden"
          >
            {/* Background sparkles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
              </motion.div>
              
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-4xl font-bold text-white mb-2"
              >
                LEVEL UP!
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xl text-gray-300 mb-4"
              >
                Level {oldLevel} → Level {newLevel}
              </motion.p>

              {bonusPointsAwarded > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Plus className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-yellow-400 font-semibold">Bonus Stat Points Awarded!</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-300">+{bonusPointsAwarded} Points</p>
                  <p className="text-sm text-gray-300 mt-1">Use them to increase your stats!</p>
                </motion.div>
              )}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <Button onClick={onClose} size="lg">
                  Continue Your Journey
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}