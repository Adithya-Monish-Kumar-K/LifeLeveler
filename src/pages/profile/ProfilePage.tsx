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
  const [email, setEmail] = useState(profile?.email || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUsernameSave = async () => {
    if (username.trim() && profile) {
      await updateUsername(username.trim());
    }
  };

  const handleEmailSave = async () => {
    if (email.trim() && profile) {
      await updateEmail(email.trim());
    }
  };

  const handleResetConfirm = async () => {
    await resetCharacter();
    setShowResetConfirm(false);
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Profile</h2>

        {/* Username */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Username</label>
          <div className="flex gap-2">
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleUsernameSave}>Save</Button>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleEmailSave}>Save</Button>
          </div>
        </div>

        {/* Reset Character */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => setShowResetConfirm(true)}
          >
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
