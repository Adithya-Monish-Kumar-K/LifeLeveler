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
    updatePhoto,a
    resetCharacter,
  } = useUserStore();

  const [username, setUsername] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.photoUrl || '');
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoSave = async () => {
    if (photoFile && profile) {
      await updatePhoto(photoFile);
      setPhotoFile(null);
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

        {/* Photo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Profile Photo</label>
          <div className="flex items-center gap-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="flex-1"
              />
              <Button size="sm" onClick={handlePhotoSave} disabled={!photoFile}>
                Upload
              </Button>
            </div>
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
