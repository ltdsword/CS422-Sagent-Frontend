import { Settings as SettingsIcon, User, Bell, Shield, Database } from "lucide-react";

export function Settings() {
  const settingsSections = [
    {
      id: "profile",
      icon: User,
      title: "Profile Settings",
      description: "Manage your account information"
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Configure your notification preferences"
    },
    {
      id: "privacy",
      icon: Shield,
      title: "Privacy & Security",
      description: "Control your data and security settings"
    },
    {
      id: "data",
      icon: Database,
      title: "Data Management",
      description: "Import, export, and manage your data"
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account and application preferences</p>
        </div>

        <div className="space-y-4">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className="w-full bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{section.title}</h3>
                    <p className="text-sm text-slate-600">{section.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
