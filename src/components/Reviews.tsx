"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { submitFeedback } from "@/app/actions/submit-feedback";
import { Star, Check, MessageSquare, Loader2 } from "lucide-react";
import { Feedback } from "@/db/queries";

interface ReviewsProps {
  initialFeedbacks?: Feedback[];
}

export function Reviews({ initialFeedbacks = [] }: ReviewsProps) {
  const [feedbacksList, setFeedbacksList] = useState<Feedback[]>(initialFeedbacks);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    quote: "",
    location: "",
    service: ""
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("rating", String(formData.rating));
    data.append("quote", formData.quote);
    data.append("location", formData.location);
    data.append("service", formData.service);
    data.append("company", ""); // Honeypot

    try {
      const res = await submitFeedback(data);
      if (res.ok) {
        setSuccess(true);
        // Add new feedback to local list in UI
        const newFb: Feedback = {
          id: Date.now(),
          name: formData.name,
          rating: formData.rating,
          quote: formData.quote,
          location: formData.location || "Kerala",
          service: formData.service || "General Home Care",
          approved: 1,
          created_at: new Date().toISOString()
        };
        setFeedbacksList([newFb, ...feedbacksList]);
        
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
          setFormData({ name: "", rating: 5, quote: "", location: "", service: "" });
        }, 2000);
      } else {
        setErrorMsg(res.error || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20">
      <Reveal>
      <div className="container mx-auto max-w-7xl text-center space-y-12">
        
        {/* Title */}
        <div className="space-y-4 max-w-xl mx-auto">
          <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
            What Our Customers Say
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Real customer feedback stored securely in our database. We strive for 100% excellence.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {feedbacksList.map((item) => (
            <div key={item.id} className="border border-slate-200/40 bg-white rounded-card p-8 flex flex-col justify-between text-left space-y-6 shadow-soft h-full transition duration-300 hover:shadow-md">

              {/* Quote and Stars */}
              <div className="space-y-4">
                {/* Star rating row */}
                <div className="flex items-center gap-0.5 select-none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.rating ? "text-amber-500 fill-current" : "text-slate-200"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-xs italic text-neutral-600 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs uppercase select-none">
                  {item.name.substring(0, 2)}
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-extrabold text-neutral-900">
                    {item.name}
                  </span>
                  <span className="block text-[0.65rem] text-slate-400 mt-0.5 font-bold">
                    {item.location || "Kerala"} • <span className="text-primary-600 uppercase tracking-wide">{item.service || "General Service"}</span>
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Action Button & Form */}
        <div className="max-w-xl mx-auto pt-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 mx-auto cursor-pointer transition select-none"
            >
              <MessageSquare className="w-4 h-4 text-primary-600" />
              Write Customer Feedback & Rating
            </button>
          ) : (
            <div className="bg-white border border-slate-200 rounded-card p-6 md:p-8 shadow-soft text-left space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 font-display">
                  Share Your Experience
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {success ? (
                <div className="py-8 text-center space-y-3">
                  <span className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <Check className="w-6 h-6 stroke-[3.5]" />
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800">Feedback Submitted Successfully!</h4>
                  <p className="text-[11px] text-slate-400">Thank you for helping us maintain premium quality standards.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  {/* Honeypot */}
                  <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

                  {/* Interactive Star Picker */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1.5 select-none pt-1">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const val = idx + 1;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: val })}
                            onMouseEnter={() => setHoverRating(val)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-0.5 hover:scale-110 transition cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                val <= (hoverRating ?? formData.rating)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                      />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Your Town/City
                      </label>
                      <input
                        type="text"
                        disabled={loading}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Thiruvalla, Pathanamthitta"
                        className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                      />
                    </div>
                  </div>

                  {/* Service Invoiced */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Service Availed
                    </label>
                    <input
                      type="text"
                      disabled={loading}
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      placeholder="e.g. Solar Installation, Deep Well Cleaning"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                    />
                  </div>

                  {/* Quote Message */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Review Message
                    </label>
                    <textarea
                      required
                      disabled={loading}
                      rows={3}
                      value={formData.quote}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      placeholder="Write your feedback..."
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 flex items-center justify-center gap-1.5 transition cursor-pointer select-none"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
      </Reveal>
    </section>
  );
}
