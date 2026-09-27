import type { Metadata } from "next";
import { Activity, BookOpen, FileText, LayoutTemplate, MessageSquareText, Mountain } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import connectToDatabase from "@/lib/mongodb";
import HomeComponent from "@/models/HomeComponent";
import Inquiry from "@/models/Inquiry";
import Post from "@/models/Post";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type ActivityItem = { id: string; name: string; detail: string; date: Date; kind: "inquiry" | "post" };

function dateLabel(date: Date) {
  const elapsed = Date.now() - date.getTime();
  const days = Math.floor(elapsed / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export default async function AdminOverviewPage() {
  let totalPosts = 0;
  let publishedPosts = 0;
  let draftPosts = 0;
  let newInquiries = 0;
  let sectionCount = 0;
  let activity: ActivityItem[] = [];
  let unavailable = false;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const chartStart = new Date(now);
  chartStart.setDate(chartStart.getDate() - 29);
  chartStart.setHours(0, 0, 0, 0);
  const dailyPublished = new Array<number>(30).fill(0);

  try {
    await connectToDatabase();
    const [postCount, publishedCount, draftCountResult, inquiryCount, sectionCountResult, recentPosts, recentInquiries, chartPosts] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: "Published" }),
      Post.countDocuments({ status: "Draft" }),
      Inquiry.countDocuments({ status: "New" }),
      HomeComponent.countDocuments(),
      Post.find().sort({ updatedAt: -1 }).limit(4).select("title status updatedAt").lean(),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).select("name email tripSlug groupSize status createdAt").lean(),
      Post.find({ status: "Published", createdAt: { $gte: chartStart } }).select("createdAt").lean(),
    ]);
    totalPosts = postCount;
    publishedPosts = publishedCount;
    draftPosts = draftCountResult;
    newInquiries = inquiryCount;
    sectionCount = sectionCountResult;

    for (const post of chartPosts) {
      const dayIndex = Math.floor((post.createdAt.getTime() - chartStart.getTime()) / 86_400_000);
      if (dayIndex >= 0 && dayIndex < dailyPublished.length) dailyPublished[dayIndex] += 1;
    }

    activity = [
      ...recentInquiries.map((item) => ({
        id: `inquiry-${item._id}`,
        name: item.name,
        detail: `Asked about ${item.tripSlug || "a custom Nepal trip"} · ${item.groupSize} travellers · ${item.status}`,
        date: item.createdAt,
        kind: "inquiry" as const,
      })),
      ...recentPosts.map((item) => ({
        id: `post-${item._id}`,
        name: item.title,
        detail: `${item.status === "Published" ? "Published" : "Updated draft"} · Blog post`,
        date: item.updatedAt,
        kind: "post" as const,
      })),
    ].sort((left, right) => right.date.getTime() - left.date.getTime()).slice(0, 7);
  } catch {
    unavailable = true;
  }

  const chartMax = Math.max(1, ...dailyPublished);
  const chartPoints = dailyPublished.map((count, index) => {
    const x = (index / Math.max(1, dailyPublished.length - 1)) * 100;
    const y = 100 - (count / chartMax) * 82 - 8;
    return `${x},${y}`;
  }).join(" ");
  const publishedThisMonth = activity.filter((item) => item.kind === "post" && item.detail.startsWith("Published") && item.date >= monthStart).length;

  return (
    <AdminShell>
      <div className="dashboard-page">
        <section className="dashboard-heading"><div><p className="admin-eyebrow">CONTENT STUDIO</p><h1>Dashboard</h1><p>Overview of your travel site and recent activity.</p></div><div className="dashboard-date"><span>Today</span><strong>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(now)}</strong></div></section>
        {unavailable && <div className="dashboard-alert" role="status">Dashboard data is unavailable. Check the MongoDB connection and reload.</div>}
        <section className="dashboard-metrics" aria-label="Site summary">
          <article className="dashboard-metric"><div className="metric-heading"><span>Total posts</span><span className="metric-icon mint"><FileText size={17} /></span></div><strong>{totalPosts}</strong><small>{draftPosts} drafts · {publishedPosts} published</small></article>
          <article className="dashboard-metric"><div className="metric-heading"><span>Published posts</span><span className="metric-icon blue"><BookOpen size={17} /></span></div><strong>{publishedPosts}</strong><small>{publishedThisMonth} published this month</small></article>
          <article className="dashboard-metric"><div className="metric-heading"><span>New inquiries</span><span className="metric-icon amber"><MessageSquareText size={17} /></span></div><strong>{newInquiries}</strong><small>Awaiting a response</small></article>
          <article className="dashboard-metric"><div className="metric-heading"><span>Homepage sections</span><span className="metric-icon lilac"><LayoutTemplate size={17} /></span></div><strong>{sectionCount}</strong><small>Custom sections configured</small></article>
        </section>

        <section className="dashboard-panels">
          <article className="dashboard-panel overview-panel"><div className="panel-heading"><div><p className="admin-eyebrow">PUBLISHING</p><h2>Published posts</h2><p>Daily activity over the last 30 days</p></div><span className="panel-total"><strong>{publishedPosts}</strong><small>total</small></span></div>{chartPostsEmpty(unavailable, publishedPosts) ? <div className="chart-empty"><Activity size={20} /><span>Published posts will appear here as you share travel stories.</span></div> : <div className="chart-wrap"><div className="chart-axis"><span>{chartMax}</span><span>{Math.ceil(chartMax / 2)}</span><span>0</span></div><svg className="activity-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Published post activity over the last 30 days"><defs><linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4a7555" stopOpacity=".22" /><stop offset="100%" stopColor="#4a7555" stopOpacity="0" /></linearGradient></defs><line x1="0" y1="17" x2="100" y2="17" className="chart-gridline" /><line x1="0" y1="58" x2="100" y2="58" className="chart-gridline" /><line x1="0" y1="92" x2="100" y2="92" className="chart-gridline" /><polygon points={`0,100 ${chartPoints} 100,100`} fill="url(#activity-fill)" /><polyline points={chartPoints} className="chart-line" vectorEffect="non-scaling-stroke" />{dailyPublished.map((count, index) => count > 0 && <circle key={index} cx={(index / Math.max(1, dailyPublished.length - 1)) * 100} cy={100 - (count / chartMax) * 82 - 8} r="1.05" className="chart-dot" />)}</svg><div className="chart-dates"><span>30 days ago</span><span>Today</span></div></div>}<div className="panel-footnote"><span><i /> Published</span><span>Drafts are not included</span></div></article>
          <article className="dashboard-panel activity-panel"><div className="panel-heading"><div><p className="admin-eyebrow">LATEST UPDATES</p><h2>Recent activity</h2></div><span className="activity-count">{activity.length}</span></div>{activity.length ? <ul className="activity-list">{activity.map((item) => <li key={item.id}><span className={`activity-avatar ${item.kind}`}>{item.kind === "inquiry" ? item.name.slice(0, 1).toUpperCase() : <FileText size={15} />}</span><span className="activity-copy"><strong>{item.name}</strong><small>{item.detail}</small></span><time>{dateLabel(item.date)}</time></li>)}</ul> : <div className="activity-empty"><Mountain size={21} /><span>New inquiries and post updates will appear here.</span></div>}</article>
        </section>
      </div>
    </AdminShell>
  );
}

function chartPostsEmpty(unavailable: boolean, publishedCount: number) {
  return unavailable || publishedCount === 0;
}

