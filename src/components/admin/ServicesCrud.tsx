"use client";

import { useState, useTransition, Fragment } from "react";
import { Service } from "@/db/queries";
import { createServiceAction, updateServiceAction, deleteServiceAction } from "@/app/admin/actions";
import { Plus, Trash2, Edit2, Loader2, X } from "lucide-react";
import Image from "next/image";

interface ServicesCrudProps {
  services: Service[];
  canEdit: boolean;
}

const PRESET_IMAGES = [
  { label: "Home Services (Default)", value: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/home-services.webp" },
  { label: "Water Tank Cleaning", value: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/water-tank.webp" },
  { label: "CCTV Installation", value: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/cctv-install.webp" },
  { label: "Roof Waterproofing", value: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/roof-waterproof.webp" },
  { label: "Grass Trimming", value: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/grass-trimming.webp" },
];

export function ServicesCrud({ services, canEdit }: ServicesCrudProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("All");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [catQuery, setCatQuery] = useState("");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  // Extract unique categories dynamically from current services list, fallback to defaults if empty
  const existingCategories = services.length > 0
    ? Array.from(new Set(services.map((s) => s.category)))
    : [
        "Water Services",
        "Home Safety",
        "Outdoor Services",
        "Pest Control",
        "Farm Services",
      ];

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    desc: "",
    price: "",
    mrp_price: "",
    offer_price: "",
    img: PRESET_IMAGES[0].value,
    sort: 0,
  });

  const handleFormOpen = (service?: Service) => {
    setErrorMsg("");
    setImageFile(null);
    setImagePreview(null);

    if (service) {
      setEditingService(service);
      const prefilledOfferPrice = service.offer_price 
        ? service.offer_price.replace(/^₹/, "") 
        : service.price.replace(/^₹/, "");

      setFormData({
        name: service.name,
        category: service.category,
        desc: service.desc,
        price: prefilledOfferPrice,
        mrp_price: service.mrp_price ? service.mrp_price.replace(/^₹/, "") : "",
        offer_price: prefilledOfferPrice,
        img: service.img,
        sort: service.sort,
      });
      setCatQuery(service.category);
      setFormOpen(true);
    } else {
      const defaultCategory = existingCategories[0] || "Water Services";
      setEditingService(null);
      setFormData({
        name: "",
        category: defaultCategory,
        desc: "",
        price: "",
        mrp_price: "",
        offer_price: "",
        img: PRESET_IMAGES[0].value,
        sort: services.length + 1,
      });
      setCatQuery(defaultCategory);
      setFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingService(null);
    setErrorMsg("");
    setImageFile(null);
    setImagePreview(null);
    setCatQuery("");
    setCatDropdownOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormData({ ...formData, img: "" }); // Reset preset path when uploading a file
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const finalCategory = formData.category.trim();
    if (!finalCategory) {
      setErrorMsg("Please select or enter a category name.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", finalCategory);
    data.append("desc", formData.desc);
    // Sync price parameter to offer_price for backward compatibility
    data.append("price", formData.offer_price);
    data.append("mrp_price", formData.mrp_price);
    data.append("offer_price", formData.offer_price);
    data.append("img", formData.img);
    data.append("sort", String(formData.sort));
    
    if (imageFile) {
      data.append("imageFile", imageFile);
    }

    startTransition(async () => {
      try {
        let res;
        if (editingService) {
          res = await updateServiceAction(editingService.id, data);
        } else {
          res = await createServiceAction(data);
        }

        if (res?.error) {
          setErrorMsg(res.error);
        } else {
          handleFormClose();
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(`Failed to ${editingService ? "update" : "create"} service.`);
      }
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the service "${name}" permanently?`)) {
      return;
    }

    try {
      const res = await deleteServiceAction(id);
      if (res?.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    }
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Service Name
            </label>
            <input
              type="text"
              required
              disabled={isPending}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Deep Well Cleaning"
              className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
            />
          </div>

          {/* Category Dropdown and Searchable input */}
          <div className="flex flex-col space-y-1.5 relative">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Category
            </label>
            <input
              type="text"
              required
              disabled={isPending}
              value={catQuery}
              onChange={(e) => {
                const val = e.target.value;
                setCatQuery(val);
                setFormData({ ...formData, category: val });
                setCatDropdownOpen(true);
              }}
              onFocus={() => setCatDropdownOpen(true)}
              onBlur={() => {
                // Allow button click to complete before closing dropdown
                setTimeout(() => setCatDropdownOpen(false), 250);
              }}
              placeholder="Search or type new category..."
              className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition w-full"
            />
            
            {catDropdownOpen && (
              <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto select-none divide-y divide-slate-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {existingCategories
                  .filter((cat) =>
                    cat.toLowerCase().includes(catQuery.toLowerCase())
                  )
                  .map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCatQuery(cat);
                        setFormData({ ...formData, category: cat });
                        setCatDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-bold transition text-xs cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                {catQuery.trim() &&
                  !existingCategories.some(
                    (cat) => cat.toLowerCase() === catQuery.trim().toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = catQuery.trim();
                        setCatQuery(trimmed);
                        setFormData({ ...formData, category: trimmed });
                        setCatDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-primary-50 text-primary-600 font-black transition border-t border-slate-100 flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      <span className="text-[0.55rem] bg-primary-100 px-1.5 py-0.5 rounded-md font-black">NEW</span>
                      Create category &ldquo;{catQuery.trim()}&rdquo;
                    </button>
                  )}
                {existingCategories.filter((cat) =>
                  cat.toLowerCase().includes(catQuery.toLowerCase())
                ).length === 0 && !catQuery.trim() && (
                  <div className="px-4 py-3 text-slate-400 font-semibold text-xs text-center">
                    Type to search or create a category...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-1 sm:col-span-2">
            {/* MRP Price */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                MRP Price (Optional)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xs font-extrabold text-slate-500 select-none">
                  ₹
                </span>
                <input
                  type="text"
                  disabled={isPending}
                  value={formData.mrp_price}
                  onChange={(e) => setFormData({ ...formData, mrp_price: e.target.value })}
                  placeholder="e.g. 3,499"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>
            </div>

            {/* Offer Price */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                Offer Price (Required)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xs font-extrabold text-slate-500 select-none">
                  ₹
                </span>
                <input
                  type="text"
                  required
                  disabled={isPending}
                  value={formData.offer_price}
                  onChange={(e) => setFormData({ ...formData, offer_price: e.target.value })}
                  placeholder="e.g. 2,499"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Sort Order
            </label>
            <input
              type="number"
              required
              disabled={isPending}
              value={formData.sort}
              onChange={(e) => setFormData({ ...formData, sort: Number(e.target.value) })}
              placeholder="e.g. 1"
              className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
            Description
          </label>
          <textarea
            required
            disabled={isPending}
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            placeholder="Briefly describe the service offering..."
            rows={3}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
          />
        </div>

        {/* Service Image */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
            Service Image
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-[0.55rem] font-extrabold text-slate-400 uppercase">Select Preset</span>
              <select
                disabled={isPending}
                value={PRESET_IMAGES.some(p => p.value === formData.img) ? formData.img : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData({ ...formData, img: e.target.value });
                    setImageFile(null);
                    setImagePreview(null);
                  }
                }}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
              >
                <option value="" disabled>-- Select Preset Image --</option>
                {PRESET_IMAGES.map((img) => (
                  <option key={img.value} value={img.value}>
                    {img.label}
                  </option>
                ))}
                {(!PRESET_IMAGES.some(p => p.value === formData.img) && formData.img) && (
                  <option value={formData.img}>Custom Image Path</option>
                )}
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="text-[0.55rem] font-extrabold text-slate-400 uppercase">Or Upload File</span>
              <div className="relative flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  disabled={isPending}
                  onChange={handleFileChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 focus:outline-none transition file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[0.65rem] file:font-extrabold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 file:cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Upload or Preset Preview */}
          {(imagePreview || formData.img) && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 select-none">
                <Image
                  src={imagePreview || formData.img}
                  alt="Service image preview"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="leading-tight min-w-0 flex-grow">
                <span className="block text-[0.6rem] font-black text-slate-400 uppercase tracking-wider">Image Previewing</span>
                <span className="block text-xs font-bold text-slate-700 truncate mt-0.5">
                  {imageFile ? `${imageFile.name} (Ready to upload)` : formData.img}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form actions */}
        <div className="pt-2 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={handleFormClose}
            className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer select-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 transition cursor-pointer select-none"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {editingService ? "Save Changes" : "Create Service"}
          </button>
        </div>
      </form>
    );
  };

  // Filter services by category tab
  const filteredServices = activeTab === "All"
    ? services
    : services.filter((s) => s.category === activeTab);

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display">
            Services Catalog Content
          </h2>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Create, update, and sort the service offerings displayed to visitors on the landing page.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => handleFormOpen()}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 transition cursor-pointer select-none"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            Add Service
          </button>
        )}
      </div>

      {/* Expandable Form */}
      {formOpen && !editingService && (
        <div className="bg-white border border-slate-200 rounded-card p-6 shadow-sm max-w-2xl text-left space-y-4 relative animate-in fade-in duration-200">
          <button
            onClick={handleFormClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
            aria-label="Close form"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-xs font-extrabold text-[#1F2744] uppercase tracking-wider">
            New Service offering
          </h3>

          {errorMsg && (
            <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          {renderForm()}
        </div>
      )}

      {/* Category Tabs for Differentiating Categories */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200 select-none">
        {["All", ...existingCategories].map((cat) => {
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-200 cursor-pointer select-none ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                  : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Services List Table (Desktop) */}
      <div className="hidden md:block overflow-hidden border border-slate-200 bg-white rounded-card shadow-sm">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 select-none">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Image</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Service Name</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Category</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Description</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">MRP Price</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Offer Price</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Sort</th>
              {canEdit && (
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem] text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredServices.map((service) => {
              const isEditing = editingService?.id === service.id;
              return (
                <Fragment key={service.id}>
                  <tr className={`hover:bg-slate-50/50 transition ${isEditing ? "bg-slate-50 font-bold" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <Image
                          src={service.img}
                          alt={service.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{service.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 text-[0.65rem] font-bold text-primary-700 bg-primary-50 rounded-badge uppercase tracking-wider">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-slate-500 font-medium line-clamp-2 mt-3.5 block border-none">{service.desc}</td>
                    <td className="px-6 py-4 text-slate-400 line-through">
                      {(() => {
                        const offerVal = parseInt((service.offer_price || service.price).replace(/[^0-9]/g, "")) || 0;
                        return service.mrp_price || `₹${(offerVal + 1000).toLocaleString("en-IN")}`;
                      })()}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600">{service.offer_price || service.price}</td>
                    <td className="px-6 py-4 text-slate-400">{service.sort}</td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleFormOpen(service)}
                            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id, service.name)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  {isEditing && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={canEdit ? 8 : 7} className="px-6 py-6 border-y border-slate-200/50">
                        <div className="max-w-2xl text-left space-y-4 relative bg-white border border-slate-200 rounded-card p-6 shadow-sm mx-auto animate-in fade-in slide-in-from-top-1 duration-200">
                          <button
                            onClick={handleFormClose}
                            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                            aria-label="Close form"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <h3 className="text-xs font-extrabold text-[#1F2744] uppercase tracking-wider">
                            Edit Service: {service.name}
                          </h3>
                          {errorMsg && (
                            <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                              {errorMsg}
                            </div>
                          )}
                          {renderForm()}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No services found in this category. Click &quot;Add Service&quot; above to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredServices.map((service) => {
          const isEditing = editingService?.id === service.id;
          if (isEditing) {
            return (
              <div
                key={service.id}
                className="border-2 border-primary-500 bg-slate-50/50 rounded-card p-5 space-y-4 shadow-sm text-left relative animate-in fade-in duration-200"
              >
                <button
                  onClick={handleFormClose}
                  className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  aria-label="Close form"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-xs font-extrabold text-[#1F2744] uppercase tracking-wider">
                  Edit Service: {service.name}
                </h3>
                {errorMsg && (
                  <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                    {errorMsg}
                  </div>
                )}
                {renderForm()}
              </div>
            );
          }
          return (
            <div
              key={service.id}
              className="border border-slate-200 bg-white rounded-card p-5 space-y-4 shadow-sm text-left animate-in fade-in duration-200"
            >
              <div className="flex gap-4 items-center border-b border-slate-100 pb-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={service.img}
                    alt={service.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <h4 className="text-sm font-extrabold text-slate-900">{service.name}</h4>
                  <span className="inline-block px-2 py-0.5 text-[0.6rem] font-bold text-primary-700 bg-primary-50 rounded-badge uppercase tracking-wider mt-1">
                    {service.category}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">MRP Price:</span>
                  <span className="text-slate-500 font-semibold line-through">
                    {(() => {
                      const offerVal = parseInt((service.offer_price || service.price).replace(/[^0-9]/g, "")) || 0;
                      return service.mrp_price || `₹${(offerVal + 1000).toLocaleString("en-IN")}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Offer Price:</span>
                  <span className="text-emerald-600 font-extrabold">{service.offer_price || service.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Sort Order:</span>
                  <span className="text-slate-800 font-extrabold">{service.sort}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.65rem] block mb-1">Description:</span>
                  <p className="text-slate-600 font-medium leading-relaxed">{service.desc}</p>
                </div>
              </div>

              {canEdit && (
                <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                  <button
                    onClick={() => handleFormOpen(service)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition cursor-pointer select-none"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 text-xs font-bold rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer select-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filteredServices.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-card bg-white select-none">
            <p className="text-sm text-slate-400 font-medium">No services found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
