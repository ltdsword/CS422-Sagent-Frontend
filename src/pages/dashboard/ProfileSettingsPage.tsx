import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Lock, Save, User as UserIcon, KeyRound } from "lucide-react";
import { Toaster } from "sonner";
import { isAxiosError } from "axios";

import { useAuth } from "@/shared/hooks/useAuth";
import { changePassword, getProfile, updateProfile, type ProfileResponse } from "@/features/auth/api/account-api";
import { getApiErrorMessage } from "@/features/workspaces/utils/api-error";
import { appToast } from "@/shared/utils/toast-prefs";

function pickInitialDisplayName(profile: ProfileResponse | null, fallback: string) {
  const raw =
    profile?.full_name?.trim() ||
    profile?.name?.trim() ||
    profile?.username?.trim() ||
    profile?.email?.trim() ||
    fallback;
  return raw || "";
}

export function ProfileSettings() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setDisplayName("");
      setUsername("");
      setEmail("");
      return;
    }

    setProfileLoading(true);
    try {
      const p = await getProfile();
      setProfile(p);
      setDisplayName(pickInitialDisplayName(p, user.name));
      setUsername(p.username?.trim() ?? "");
      setEmail(p.email?.trim() ?? "");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      appToast.error(getApiErrorMessage(err, "Could not load profile"));
    } finally {
      setProfileLoading(false);
    }
  }, [isAuthenticated, logout, navigate, user.name]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const profileDirty = useMemo(() => {
    if (!profile) {
      return Boolean(displayName.trim() || username.trim() || email.trim());
    }
    const initialName = pickInitialDisplayName(profile, user.name);
    return (
      displayName.trim() !== initialName.trim() ||
      username.trim() !== (profile.username?.trim() ?? "") ||
      email.trim() !== (profile.email?.trim() ?? "")
    );
  }, [displayName, email, profile, user.name, username]);

  const handleSaveProfile = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const nextUsername = username.trim();
    const nextEmail = email.trim();
    const nextName = displayName.trim();

    if (!nextUsername && !nextEmail && !nextName) {
      appToast.message("Nothing to update");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        username: nextUsername || undefined,
        email: nextEmail || undefined,
        full_name: nextName || undefined,
      });
      setProfile(updated);
      appToast.success("Profile updated");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      appToast.error(
        getApiErrorMessage(
          err,
          "Could not update profile (backend endpoint may not support profile edits yet)",
        ),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const old_password = currentPassword;
    const new_password = newPassword;

    if (!old_password || !new_password) {
      appToast.error("Please fill in current and new password");
      return;
    }
    if (new_password.length < 8) {
      appToast.error("New password must be at least 8 characters");
      return;
    }
    if (new_password !== confirmNewPassword) {
      appToast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ old_password, new_password });
      appToast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      // If the endpoint doesn't exist yet, make that clear.
      if (isAxiosError(err) && err.response?.status === 404) {
        appToast.error("Password change endpoint is not available on the backend yet.");
        return;
      }
      appToast.error(getApiErrorMessage(err, "Could not change password"));
    } finally {
      setSavingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link to="/settings" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <KeyRound className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-slate-900 mb-2">Log in to manage your profile</h1>
            <p className="text-slate-600 mb-6">Update your username, email, and password.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-slate-900 mb-2">Profile settings</h1>
                <p className="text-slate-600">Update your account information and password</p>
              </div>
              <button
                type="button"
                onClick={() => void loadProfile()}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {profileLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-600 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              Loading profile…
            </div>
          ) : (
            <div className="space-y-6">
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-slate-900">Account information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Display name</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Username</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="username"
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={savingProfile || !profileDirty}
                      onClick={() => void handleSaveProfile()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" />}
                      Save changes
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-slate-900">Change password</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={savingPassword}
                      onClick={() => void handleChangePassword()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                      {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Lock className="w-4 h-4" />}
                      Update password
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

