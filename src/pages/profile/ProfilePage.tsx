import { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';

export function ProfilePage() {
  const {
    profile,
    updateUsername,
    updateEmail,
    resetCharacter,
  } = useUserStore();

  const [username, setUsername] = useState(profile?.name || '');
  const [email] = useState(profile?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUsernameSave = async () => {
    if (username.trim() && profile) {
      await updateUsername(username.trim());
      setIsEditing(false);
    }
  };

  const handleResetConfirm = () => {
    // Close dialog immediately
    setShowResetConfirm(false);
    // Then perform reset
    resetCharacter();
  };

  if (!profile) return <p className="text-white">Loading profile...</p>;

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <Card className="p-6 space-y-4 bg-gray-800">
        <h2 className="text-2xl font-bold text-white">Profile</h2>

        {/* Username */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Username</label>
          <div className="flex gap-2">
            {isEditing ? (
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="flex-1"
              />
            ) : (
              <p className="flex-1 text-white">{username}</p>
            )}
            {isEditing ? (
              <Button size="sm" onClick={handleUsernameSave}>Save</Button>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Email</label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              disabled
              className="flex-1 bg-gray-700 text-white"
            />
          </div>
        </div>

        {/* Reset Character */}
        <div className="pt-4 border-t border-gray-600">
          <Button size="sm" onClick={() => setShowResetConfirm(true)}>
            Reset Character
          </Button>
        </div>
      </Card>

      {/* Confirm Reset Dialog */}
      {showResetConfirm && (
        <Dialog
          title="Confirm Reset"
          description="This will reset your character to level 1 and clear all progress. This cannot be undone."
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleResetConfirm}
        />
      )}
    </div>
  );
}
