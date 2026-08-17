import { CheckCircle, CircleHelp } from "lucide-react";
import { useState } from "react";
import {
  LuChevronRight,
  LuFileText,
  LuHeadphones,
  LuMail,
  LuMapPin,
  LuPhone,
  LuRefreshCw,
  LuSend,
  LuShieldCheck,
  LuTruck,
} from "react-icons/lu";
import { Link, useParams } from "react-router-dom";
import { infoPagesData } from "../data/infoPagesData";

const iconMap = {
  LuHeadphones: LuHeadphones,
  LuTruck: LuTruck,
  LuRefreshCw: LuRefreshCw,
  LuShieldCheck: LuShieldCheck,
  LuFileText: LuFileText,
  LuPhone: LuPhone,
  LuMail: LuMail,
  LuMapPin: LuMapPin,
};

function InfoPage({ pageSlug: pageSlugProp }) {
  const { pageSlug: routeSlug } = useParams();
  const slug = pageSlugProp || routeSlug || "contact-support";
  const pageData = infoPagesData[slug] || infoPagesData["contact-support"];

  const PageIcon = iconMap[pageData.icon] || LuFileText;

  // Contact form local state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="pt-20 sm:pt-24 pb-16 bg-neutral-50 min-h-screen">
      {/* Page Header Hero */}
      <div className="bg-neutral-900 text-white py-12 sm:py-16 mb-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <LuChevronRight className="h-3 w-3" />
            <span className="text-accent font-semibold">{pageData.title}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent/20 text-accent rounded-2xl">
              <PageIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {pageData.title}
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Last updated: {pageData.lastUpdated}
              </p>
            </div>
          </div>

          <p className="text-neutral-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            {pageData.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 sticky top-24">
              <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 px-3">
                Customer Care & Policies
              </h3>
              <nav className="space-y-1">
                {Object.keys(infoPagesData).map((key) => {
                  const item = infoPagesData[key];
                  const ItemIcon = iconMap[item.icon] || LuFileText;
                  const isActive = key === slug;

                  return (
                    <Link
                      key={key}
                      to={`/${key}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-[#21453A] text-white shadow-sm"
                          : "text-black hover:bg-[#F7F8FA] hover:text-[#111827]"
                      }`}
                    >
                      <ItemIcon className="h-4 w-4 " />
                      <span className="">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Page Specific Content Sections */}
          <div className="lg:col-span-3 space-y-8">
            {pageData.sections?.map((section, idx) => {
              if (section.type === "contact-channels") {
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {section.channels.map((ch, cIdx) => {
                      const ChIcon = iconMap[ch.icon] || LuMail;
                      return (
                        <div
                          key={cIdx}
                          className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="p-3 bg-neutral-100 text-accent rounded-xl w-fit mb-4">
                              <ChIcon className="h-5 w-5" />
                            </div>
                            <h4 className="font-bold text-neutral-900 text-base mb-1">
                              {ch.title}
                            </h4>
                            <p className="text-accent font-extrabold text-sm mb-1">
                              {ch.detail}
                            </p>
                          </div>
                          <p className="text-xs text-neutral-400">
                            {ch.subdetail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              if (section.type === "form") {
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                      {section.description}
                    </p>

                    {formSubmitted ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center space-y-2">
                        <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
                        <h4 className="font-bold text-lg">Thank You!</h4>
                        <p className="text-sm text-emerald-700">
                          Your message has been sent successfully. Our support
                          team will respond within 24 hours.
                        </p>
                        <button
                          onClick={() => setFormSubmitted(false)}
                          className="mt-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Send Another Message
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="John Doe"
                              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              placeholder="john@example.com"
                              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Subject *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subject: e.target.value,
                              })
                            }
                            placeholder="Order inquiry, exchange request..."
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Message Details *
                          </label>
                          <textarea
                            rows={4}
                            required
                            value={formData.message}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                message: e.target.value,
                              })
                            }
                            placeholder="Describe how we can assist you..."
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all"
                        >
                          <LuSend className="h-4 w-4" />
                          <span>Submit Request</span>
                        </button>
                      </form>
                    )}
                  </div>
                );
              }

              if (section.type === "faq") {
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                      <CircleHelp className="h-5 w-5 text-accent" />
                      <span>{section.title}</span>
                    </h3>
                    <div className="space-y-4">
                      {section.items.map((item, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-4 bg-neutral-50 rounded-xl border border-neutral-100"
                        >
                          <h4 className="font-bold text-neutral-900 text-sm mb-2">
                            {item.q}
                          </h4>
                          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (section.type === "grid") {
                return (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-xl font-bold text-neutral-900 mb-4">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {section.items.map((it, iIdx) => (
                        <div
                          key={iIdx}
                          className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <span className="inline-block bg-accent/10 text-accent text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md mb-3">
                              {it.badge}
                            </span>
                            <h4 className="font-bold text-neutral-900 text-base mb-1">
                              {it.name}
                            </h4>
                            <p className="text-xs font-semibold text-neutral-500 mb-3">
                              ⏱ {it.time}
                            </p>
                            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                              {it.description}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-neutral-100 font-black text-accent text-sm">
                            {it.cost}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (section.type === "highlights") {
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {section.items.map((hl, hIdx) => (
                      <div
                        key={hIdx}
                        className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm"
                      >
                        <h4 className="font-bold text-accent text-base mb-2">
                          {hl.title}
                        </h4>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {hl.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              }

              if (section.type === "steps") {
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-neutral-900 mb-6">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {section.steps.map((st, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-neutral-50 p-4 rounded-xl border border-neutral-100"
                        >
                          <span className="text-2xl font-black text-accent block mb-2">
                            {st.number}
                          </span>
                          <h4 className="font-bold text-neutral-900 text-sm mb-1">
                            {st.title}
                          </h4>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            {st.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (section.type === "text") {
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-neutral-900 mb-4">
                      {section.title}
                    </h3>
                    <div className="space-y-3">
                      {section.content.map((pText, pIdx) => (
                        <p
                          key={pIdx}
                          className="text-sm text-neutral-600 leading-relaxed"
                        >
                          {pText}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
