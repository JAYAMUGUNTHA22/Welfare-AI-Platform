import { Link } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Wallet,
  FolderOpen,
  ArrowRight,
  Clock,
  Sparkles as SparkleOutline,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { SchemeCard } from "@/components/shared/SchemeCard";
import { Card } from "@/components/ui/Card";
import { getDashboardData, getFarmerRecommendationsApi, getMe, saveSchemeRecommendations } from "@/services/api";
import { useTranslation } from "react-i18next";
import { getPersonalizedSchemeRecommendations } from "@/data/myschemeDataset";

export function DashboardPage() {
  const { t } = useTranslation();
  const hour = new Date().getHours();
  const [dashboardData, setDashboardData] = useState(null);
  const [user, setUser] = useState(null);
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        let cachedUser = null;
        try {
          cachedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
        } catch (error) {
          console.warn("Could not read the cached user profile", error);
        }

        const [dashResult, userResult] = await Promise.allSettled([
          getDashboardData(),
          getMe(),
        ]);
        if (dashResult.status === "fulfilled") {
          setDashboardData(dashResult.value);
        } else {
          console.warn("Could not load dashboard summary data", dashResult.reason);
        }

        const currentUser = userResult.status === "fulfilled"
          ? userResult.value?.user || userResult.value || cachedUser
          : cachedUser;
        if (userResult.status === "rejected") {
          console.warn("Could not refresh the user profile; using the saved profile if available.", userResult.reason);
        }
        setUser(currentUser);
        let recommendations = await getPersonalizedSchemeRecommendations(currentUser || {}, 4, { perSource: true });
        const isFarmer = currentUser?.isFarmer === true
          || /\b(farmer|agriculturist|cultivator|agricultural worker|farm worker)\b/i.test(currentUser?.occupation || "");
        if (isFarmer && localStorage.getItem("token")) {
          try {
            const farmerProgrammes = await getFarmerRecommendationsApi();
            if (Array.isArray(farmerProgrammes)) {
              for (const programme of farmerProgrammes) {
                const normalizedName = String(programme.name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                const duplicateIndex = recommendations.findIndex((existing) => (
                  (existing.schemeId && programme.schemeId && existing.schemeId === programme.schemeId)
                  || String(existing.name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() === normalizedName
                ));
                if (duplicateIndex >= 0) recommendations[duplicateIndex] = { ...recommendations[duplicateIndex], ...programme };
                else recommendations.push(programme);
              }
            }
          } catch (farmerError) {
            console.warn("Could not load farmer programmes for dashboard recommendations.", farmerError);
          }
        }
        setSchemes(recommendations);
        await saveSchemeRecommendations(currentUser || {}, recommendations);
      } catch (err) {
        console.error("Failed to load dashboard recommendations", err);
      }
    }
    loadData();
  }, []);

  const greeting =
    hour < 12
      ? t('dashboard.greeting.morning')
      : hour < 17
      ? t('dashboard.greeting.afternoon')
      : t('dashboard.greeting.evening');

   const recommendationSections = [
    {
      key: 'state',
      title: `${user?.state || t('state', { defaultValue: 'State' })} ${t('stateGovRec', { defaultValue: 'Government Recommendations' })}`,
      schemes: schemes
        .filter((scheme) => scheme.sourceType === 'state')
        .slice(0, 4),
    },
    {
      key: 'central',
      title: t('centralGovRec', {
        defaultValue: 'Central Government Recommendations',
      }),
      schemes: schemes
        .filter((scheme) => scheme.sourceType === 'central')
        .slice(0, 4),
    },
    {
      key: 'private',
      title: t('privateAssist', {
        defaultValue: 'Private-Sector and Foundation Recommendations',
      }),
      schemes: schemes.filter((scheme) => scheme.sourceType === 'private'),
    },
  ];
  const visibleRecommendationCount = recommendationSections.reduce((count, section) => count + section.schemes.length, 0);

  return (
    <DashboardLayout>
      <div className="dashboard-welcome mb-7">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-sky-600 lg:text-4xl">
          {t('dashboard.welcomeBack')}, {user?.fullName?.split(' ')[0] || t('citizen')}
          <SparkleOutline className="h-6 w-6 text-sky-400" />
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">{greeting} · {t('welcomeDashboard')}</p>
        <div className="mt-3 h-1 w-28 rounded-full bg-sky-500" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          label={t('dashboard.recommendedSchemes')}
          value={visibleRecommendationCount}
          icon={Sparkles}
          color="primary"
        />
        <DashboardCard
          label={t('dashboard.activeApplications')}
          value={dashboardData?.pendingApplications ?? 0}
          icon={FileText}
          color="accent"
        />
        <DashboardCard
          label={t('dashboard.benefitsReceived')}
          value={`₹${(dashboardData?.benefitsReceived ?? 0).toLocaleString("en-IN")}`}
          icon={Wallet}
          color="success"
        />
        <DashboardCard
          label={t('dashboard.documents')}
          value={dashboardData?.documentsCount ?? 0}
          icon={FolderOpen}
          color="navy"
        />
      </div>

      {/* Profile-matched scheme recommendations grouped by source */}
      <div className="mt-8 space-y-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('recommendationsTitle')}</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {t('recommendationsDesc')}
            </p>
          </div>
          <Link
            to="/my-schemes"
            className="hidden text-sm font-semibold text-primary-600 hover:text-primary-700 sm:flex items-center gap-1"
          >
            {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recommendationSections.map((section) => (
          <section key={section.key}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
              <Link to="/my-schemes" className="text-sm font-semibold text-primary-700 hover:text-primary-800">{t('browseAll')}</Link>
            </div>
            {section.schemes.length ? (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {section.schemes.map((scheme) => (
                  <div key={scheme.schemeId || scheme.id} className="flex flex-col gap-2">
                    <span className="w-fit rounded-full border border-sky-100 bg-white px-2.5 py-1 text-xs font-semibold text-sky-800">
                      {section.key === 'private'
                        ? (scheme.providerType || 'Private Sector / NGO/Foundation')
                        : section.key === 'central' ? 'Central Scheme' : 'State Scheme'}
                    </span>
                    <SchemeCard scheme={scheme} />
                    {scheme.officialWebsite && (
                      <a className="text-sm font-semibold text-primary-700 hover:underline" href={scheme.officialWebsite} target="_blank" rel="noopener noreferrer">
                        Official programme website <ArrowRight className="inline h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty-card rounded-2xl border bg-white p-4 text-sm text-slate-600">
                {section.key === 'private'
                  ? t('noPrivateSchemes')
                  : t('noStateSchemes')}
              </p>
            )}
          </section>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="dashboard-floating-card overflow-hidden p-0">
          <div className="dashboard-panel-heading flex items-center gap-3 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg"><Clock className="h-6 w-6" /></div>
            <div><h3 className="text-lg font-bold text-sky-600">{t('applicationStatusTitle')}</h3><p className="text-sm text-slate-500">{t('trackProgress')}</p></div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
