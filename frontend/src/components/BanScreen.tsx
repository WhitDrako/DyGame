import { Ban, Skull } from 'lucide-react';

interface BanScreenProps {
  reason?: string;
}

export default function BanScreen({ reason }: BanScreenProps) {
  return (
    <div className="ban-screen">
      <div className="ban-message px-4">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Skull className="w-32 h-32 text-red-500 animate-pulse" />
            <Ban className="w-16 h-16 text-red-600 absolute -bottom-2 -right-2" />
          </div>
        </div>

        <h1 className="ban-title font-display text-5xl">BANNED</h1>

        <p className="ban-description max-w-md mx-auto mb-8">
          Your account has been permanently banned from GPO Trading Platform.
          You are not allowed to access any part of this site.
        </p>

        {reason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-400 text-sm font-medium mb-1">Reason:</p>
            <p className="text-red-300">{reason}</p>
          </div>
        )}

        <p className="text-ocean-600 text-sm mt-8">
          If you believe this is a mistake, contact the administrator.
        </p>
      </div>
    </div>
  );
}
