/**
 * Upload Credential Page
 */
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import DashboardLayout from "../../components/common/DashboardLayout";
import { credentialAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Upload, FileText, X, CheckCircle, Loader2, AlertCircle, Image
} from "lucide-react";

const categories = ["education","employment","certification","identity","finance","training","other"];

export default function UploadCredential() {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    title: "", description: "", category: "education",
    institution: "", courseOrPosition: "", grade: "", completionDate: ""
  });
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error("Only JPG, PNG, PDF files under 10MB are accepted");
      return;
    }
    const f = accepted[0];
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"], "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a document"); return; }
    if (!form.title.trim()) { toast.error("Credential title is required"); return; }

    const fd = new FormData();
    fd.append("document", file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    setLoading(true);
    try {
      await credentialAPI.upload(fd);
      toast.success("Credential submitted for verification! 🎉");
      navigate("/wallet");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-900">Upload Credential</h1>
          <p className="text-gray-500 text-sm mt-1">Submit your document for verification by an issuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dropzone */}
          <div className="clay-card p-2">
            <div {...getRootProps()} className={`
              rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all
              ${isDragActive ? "border-emerald-500 bg-emerald-50" : "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50"}
            `}>
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    {preview
                      ? <img src={preview} alt="preview" className="w-16 h-16 rounded-xl object-cover shadow" />
                      : <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-emerald-600" />
                        </div>
                    }
                    <div className="text-left">
                      <p className="font-bold text-emerald-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                  <p className="font-bold text-emerald-700">
                    {isDragActive ? "Drop it here!" : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG • Max 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="clay-card p-6 space-y-4">
            <h2 className="font-extrabold text-emerald-900">Credential Details</h2>

            <div>
              <label className="block text-sm font-bold text-emerald-800 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange}
                className="clay-input" placeholder="e.g. Bachelor of Computer Science" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-800 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="clay-input capitalize">
                {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-800 mb-1">Institution / Issuing Body</label>
              <input name="institution" value={form.institution} onChange={handleChange}
                className="clay-input" placeholder="e.g. University of Mumbai" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-emerald-800 mb-1">Course / Position</label>
                <input name="courseOrPosition" value={form.courseOrPosition} onChange={handleChange}
                  className="clay-input" placeholder="e.g. B.Tech CSE" />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-800 mb-1">Grade / Score</label>
                <input name="grade" value={form.grade} onChange={handleChange}
                  className="clay-input" placeholder="e.g. 8.5 CGPA" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-800 mb-1">Completion Date</label>
              <input name="completionDate" type="date" value={form.completionDate} onChange={handleChange}
                className="clay-input" />
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-800 mb-1">Description (optional)</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="clay-input resize-none" rows={3} placeholder="Any additional details..." />
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-sm">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800">Your credential will be reviewed by a registered issuer. You'll receive an email when the status changes.</p>
          </div>

          <button type="submit" disabled={loading || !file}
            className="clay-button w-full py-3.5 flex items-center justify-center gap-2 text-base">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              : <><Upload className="w-5 h-5" /> Submit for Verification</>
            }
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
