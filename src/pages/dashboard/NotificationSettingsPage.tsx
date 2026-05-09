import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { Toaster } from "sonner";

import { Switch } from "@/shared/components/ui/switch";
import { appToast, loadToastPrefs, saveToastPrefs, type ToastPrefs } from "@/shared/utils/toast-prefs";

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<ToastPrefs>(() => loadToastPrefs());

  useEffect(() => {
    saveToastPrefs(prefs);
  }, [prefs]);

  const summary = useMemo(() => {
    if (prefs.inApp) return "In-app notifications enabled";
    return "In-app notifications disabled";
  }, [prefs.inApp]);

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
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-slate-900 mb-2">Notifications</h1>
                <p className="text-slate-600">{summary}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPrefs({ inApp: true });
                  appToast.success("Reset to defaults");
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-slate-900 mb-1">In-app notifications</h2>
                      <p className="text-sm text-slate-600">Controls popup toaster notifications (Sonner).</p>
                    </div>
                    <Switch
                      checked={prefs.inApp}
                      onCheckedChange={(checked) => {
                        setPrefs({ inApp: checked });
                        if (checked) {
                          appToast.success("Toasts enabled");
                        }
                      }}
                      aria-label="Toggle in-app notifications"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

