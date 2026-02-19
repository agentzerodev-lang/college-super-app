"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar, Check, XCircle, AlertCircle, Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button-new";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";

interface PeriodCourse {
  period: number;
  courseId: string;
  courseName: string;
  courseCode: string;
  status: "present" | "absent" | "late" | "not_marked";
  isUnassigned?: boolean;
  isCustomSubject?: boolean;
}

interface StudentSubject {
  _id: string;
  name: string;
  code: string;
}

interface UploadAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clerkUserId: string;
}

export function UploadAttendanceModal({ isOpen, onClose, clerkUserId }: UploadAttendanceModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [totalPeriods, setTotalPeriods] = useState(8);
  const [periodCourses, setPeriodCourses] = useState<PeriodCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  const markMyAttendance = useMutation(api.attendance.markMyAttendance);
  const addStudentSubject = useMutation(api.attendance.addStudentSubject);
  const deleteStudentSubject = useMutation(api.attendance.deleteStudentSubject);

  const courses = useQuery(
    api.timetable.getAllCourses,
    clerkUserId ? { clerkUserId } : "skip"
  );

  const mySubjects = useQuery(
    api.attendance.getMySubjects,
    clerkUserId ? { clerkUserId } : "skip"
  );

  const existingAttendance = useQuery(
    api.attendance.getMyAttendanceByDate,
    clerkUserId && selectedDate
      ? { clerkUserId, date: new Date(selectedDate).getTime() }
      : "skip"
  );

  const allCourseOptions = [
    ...(courses || []).map((c) => ({ id: c._id, name: c.name, code: c.code, type: "system" as const })),
    ...(mySubjects || []).map((s) => ({ id: s._id, name: s.name, code: s.code, type: "custom" as const })),
  ];

  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const updated = periodCourses.map((pc) => {
        const existing = existingAttendance.find(
          (att) => att.courseId === pc.courseId && att.period === pc.period
        );
        if (existing) {
          return { ...pc, status: existing.status as "present" | "absent" | "late" };
        }
        return pc;
      });
      setPeriodCourses(updated);
    }
  }, [existingAttendance]);

  const handlePeriodCountChange = (count: number) => {
    setTotalPeriods(count);
    const newPeriods: PeriodCourse[] = [];
    for (let i = 1; i <= count; i++) {
      const existing = periodCourses.find((p) => p.period === i);
      newPeriods.push(
        existing || {
          period: i,
          courseId: "",
          courseName: "Select Course",
          courseCode: "",
          status: "not_marked",
        }
      );
    }
    setPeriodCourses(newPeriods);
  };

  const handleCourseSelect = (period: number, courseId: string) => {
    const course = allCourseOptions.find((c) => c.id === courseId);
    const isCustom = course?.type === "custom";
    setPeriodCourses((prev) =>
      prev.map((p) =>
        p.period === period
          ? {
              ...p,
              courseId,
              courseName: course?.name || "Unknown",
              courseCode: course?.code || "",
              status: p.status === "not_marked" ? "present" : p.status,
              isCustomSubject: isCustom,
            }
          : p
      )
    );
  };

  const handleStatusChange = (period: number, status: "present" | "absent" | "late") => {
    setPeriodCourses((prev) =>
      prev.map((p) => (p.period === period ? { ...p, status } : p))
    );
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !newSubjectCode.trim()) {
      setError("Please enter both subject name and code");
      return;
    }

    setIsAddingSubject(true);
    setError(null);

    try {
      await addStudentSubject({
        clerkUserId,
        name: newSubjectName.trim(),
        code: newSubjectCode.trim(),
      });
      setNewSubjectName("");
      setNewSubjectCode("");
      setShowAddSubject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add subject");
    } finally {
      setIsAddingSubject(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteStudentSubject({
        clerkUserId,
        subjectId: subjectId as any,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    const validRecords = periodCourses.filter(
      (p) => p.courseId && p.status !== "not_marked"
    );

    if (validRecords.length === 0) {
      setError("Please select at least one course and mark attendance");
      return;
    }

    const dateTimestamp = new Date(selectedDate).getTime();

    setIsLoading(true);
    try {
      for (const record of validRecords) {
        if (record.status === "not_marked" || record.isUnassigned) continue;
        
        if (record.isCustomSubject) {
          await markMyAttendance({
            clerkUserId,
            studentSubjectId: record.courseId as any,
            date: dateTimestamp,
            period: record.period,
            status: record.status as "present" | "absent" | "late",
          });
        } else {
          await markMyAttendance({
            clerkUserId,
            courseId: record.courseId as any,
            date: dateTimestamp,
            period: record.period,
            status: record.status as "present" | "absent" | "late",
          });
        }
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark attendance");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "absent":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "late":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-2xl"
          >
            <GlassCard variant="elevated">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Upload Daily Attendance</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Attendance marked successfully!
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Number of Periods
                    </label>
                    <select
                      value={totalPeriods}
                      onChange={(e) => handlePeriodCountChange(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/30 transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} Period{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-300">My Subjects</h3>
                      <p className="text-xs text-slate-500">Manage your custom subjects</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddSubject(!showAddSubject)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-sm hover:bg-primary-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Subject
                    </button>
                  </div>

                  {showAddSubject && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Subject Code (e.g., CS101)"
                          value={newSubjectCode}
                          onChange={(e) => setNewSubjectCode(e.target.value.toUpperCase())}
                          className="bg-dark-800/50 border-white/10 text-white placeholder:text-slate-500"
                        />
                        <Input
                          placeholder="Subject Name"
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          className="bg-dark-800/50 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="glass"
                          size="sm"
                          onClick={() => setShowAddSubject(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleAddSubject}
                          disabled={isAddingSubject}
                          className="flex-1"
                        >
                          {isAddingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Subject"}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {mySubjects && mySubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mySubjects.map((subject) => (
                        <div
                          key={subject._id}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-800/50 border border-white/10 text-slate-300 text-xs"
                        >
                          <BookOpen className="w-3 h-3 text-primary-400" />
                          <span>{subject.code}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(subject._id)}
                            className="p-0.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!mySubjects || mySubjects.length === 0) && !showAddSubject && (
                    <p className="text-xs text-slate-500 italic">
                      No custom subjects added. Click "Add Subject" to create your own subjects.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-300">Mark Attendance by Period</h3>
                  <p className="text-xs text-slate-500">
                    Select course for each period. Unassigned periods will be ignored.
                  </p>

                  {periodCourses.map((period) => (
                    <div
                      key={period.period}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold">
                        {period.period}
                      </div>

                      <select
                        value={period.courseId}
                        onChange={(e) => handleCourseSelect(period.period, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-dark-800/50 border border-white/10 text-white text-sm focus:border-primary-500/50"
                      >
                        <option value="">Select Course (Optional)</option>
                        <optgroup label="My Subjects">
                          {mySubjects?.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.code} - {subject.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="System Courses">
                          {courses?.map((course) => (
                            <option key={course._id} value={course._id}>
                              {course.code} - {course.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>

                      {period.courseId && (
                        <div className="flex gap-1">
                          {(["present", "absent", "late"] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(period.period, status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                period.status === status
                                  ? getStatusColor(status)
                                  : "bg-transparent border-white/10 text-slate-400 hover:bg-white/5"
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-white/5 flex gap-3">
                <Button
                  type="button"
                  variant="glass"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isLoading}
                  glow
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Mark Attendance"
                  )}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
