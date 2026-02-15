import React, { useState, useEffect, ChangeEvent } from "react";
import axiosInstance from "../../api/axios";
import { isAxiosError } from "axios";

interface FormData {
  academicYearId: string;
  academicYear: string;
  universityId: string;
  instituteId: string;
  programId: string;
  branchId: string;
  yearId: string;
  semesterId: string;
}

interface AcademicYear {
  ACADEMIC_YEAR_ID: number;
  ACADEMIC_YEAR: string;
}

interface University {
  UNIVERSITY_ID: number;
  NAME: string;
}

interface Institute {
  INSTITUTE_ID: number;
  NAME: string;
  CODE: string;
}

interface Program {
  PROGRAM_ID: number;
  NAME: string;
}

interface Branch {
  BRANCH_ID: number;
  NAME: string;
}

interface Year {
  YEAR_ID: number;
  YEAR: string;
}

interface Semester {
  SEMESTER_ID: number;
  SEMESTER: string;
}

const StudentRollForm = () => {
  const [formData, setFormData] = useState<FormData>({
    academicYearId: "",
    academicYear: "",
    universityId: "",
    instituteId: "",
    programId: "",
    branchId: "",
    yearId: "",
    semesterId: "",
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  interface Student {
    ROLL_NO: any;
    STUDENT_ID: number;
    NAME: string;
    FATHER_NAME: string;
    SURNAME: string;
    BRANCH?: any;
    BRANCH_ID?: any;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'warn', text: string } | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (formData.universityId) fetchInstitutes(formData.universityId);
  }, [formData.universityId]);

  useEffect(() => {
    if (formData.instituteId) fetchPrograms(formData.instituteId);
  }, [formData.instituteId]);

  useEffect(() => {
    if (formData.programId) fetchBranches(formData.programId);
  }, [formData.programId]);

  useEffect(() => {
    if (formData.branchId) fetchYears(formData.branchId);
  }, [formData.branchId]);

  useEffect(() => {
    if (formData.yearId) fetchSemesters(formData.yearId);
  }, [formData.yearId]);

  const fetchAcademicYears = async () => {
    try {
      const response = await axiosInstance.get("/api/master/academic-years/");
      if (response.status === 200) {
        setAcademicYears(response.data);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axiosInstance.get("/api/master/universities/");
      if (response.status === 200) setUniversities(response.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const fetchInstitutes = async (universityId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/master/institutes/?university_id=${universityId}`
      );
      if (response.status === 200) setInstitutes(response.data);
    } catch (error) {
      console.error("Error fetching institutes:", error);
    }
  };

  const fetchPrograms = async (instituteId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/master/program/?institute_id=${instituteId}`
      );
      if (response.status === 200) setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchBranches = async (programId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/master/branch/?program_id=${programId}`
      );
      if (response.status === 200) setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchYears = async (branchId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/master/year/?branch_id=${branchId}`
      );
      if (response.status === 200) setYears(response.data);
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  const fetchSemesters = async (yearId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/master/semester/?year_id=${yearId}`
      );
      if (response.status === 200) setSemesters(response.data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchStudents = async () => {
    if (!formData.branchId || !formData.academicYear) {
      setMessage({ type: 'warn', text: 'Please select both Branch and Academic Year.' });
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/api/student/?branch_id=${formData.branchId}&academic_year=${formData.academicYear}`
      );

      if (response.status === 200 && response.data.status === "success") {
        setStudents(response.data.data); // Update state with fetched students
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.warn("Error fetching students:", error);
      setMessage({ type: 'warn', text: 'Failed to fetch students. Please try again.' });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Also set academicYearId when academicYear is selected
    if (name === "academicYear") {
      const selectedYear = academicYears.find(year => year.ACADEMIC_YEAR === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        academicYearId: selectedYear ? String(selectedYear.ACADEMIC_YEAR_ID) : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleShow = async () => {
    if (!formData.branchId || !formData.academicYear) {
      setMessage({ type: 'warn', text: 'Please select both Branch and Academic Year.' });
      return;
    }
    try {
      // Send both academic_year (string) and academic_year_id (id) to improve backend matching
      // Build student URL; only include academic_year_id when present
      let studentUrl = `/api/student/?branch_id=${formData.branchId}&academic_year=${encodeURIComponent(
        formData.academicYear
      )}`;
      if (formData.academicYearId) {
        studentUrl += `&academic_year_id=${encodeURIComponent(formData.academicYearId)}`;
      }
      console.log("Fetching students with:", studentUrl);

      const response = await axiosInstance.get(studentUrl);
      console.log("Students API response:", response);
      console.log("Students API response.data:", response.data);
      // Support multiple response shapes: {status:'success', data: [...]}, or raw array
      if (response.status === 200) {
        let studentsPayload: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          studentsPayload = response.data;
        } else if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
          studentsPayload = response.data.data;
        } else {
          console.warn("Unexpected students response shape:", response.data);
          const maybe = response.data?.data ?? response.data?.results ?? [];
          studentsPayload = Array.isArray(maybe) ? maybe : [];
        }

        setStudents(studentsPayload);

        // If no students returned, show a clear warning so user knows there's nothing to act on
        if (studentsPayload.length === 0) {
          setMessage({ type: 'warn', text: 'No students available for the selected Branch and Academic Year.' });
        } else {
          // Surface backend debug info to the UI when available
          const dbgCount = response.data?.debug_count ?? (Array.isArray(studentsPayload) ? studentsPayload.length : undefined);
          const dbgSample = response.data?.debug_sample ?? (Array.isArray(studentsPayload) && studentsPayload.length ? studentsPayload[0] : undefined);
          setMessage({ type: 'info', text: `Returned ${dbgCount ?? 'unknown'} students. Sample: ${dbgSample ? JSON.stringify(dbgSample) : 'none'}` });
        }
      }
    } catch (error) {
      console.warn("Error fetching students or roll numbers:", error);
      setMessage({ type: 'warn', text: 'Failed to fetch students or roll numbers.' });
    }
  };

  // roll number editing removed — student ID is used as roll number

  const handleSave = async () => {
    try {
      // Validate all required fields are present
      if (!formData.academicYearId || !formData.branchId || 
          !formData.instituteId || !formData.semesterId || !formData.yearId) {
        setMessage({ type: 'warn', text: 'Please select all required fields.' });
        return;
      }

      // Validate there are students to save
      if (students.length === 0) {
        setMessage({ type: 'warn', text: 'No students available to save roll numbers for.' });
        return;
      }

      // Create payload with ALL required fields as IDs/PKs
      const payload = students.map((student) => {
        // Ensure we have proper values that won't be null
        const academicYearIdNum = parseInt(formData.academicYearId) || 0;
        const branchIdNum = parseInt(formData.branchId) || 0;
        const instituteIdNum = parseInt(formData.instituteId) || 0;
        const semesterIdNum = parseInt(formData.semesterId) || 0;
        const yearIdNum = parseInt(formData.yearId) || 0;
        
        return {
          // All fields as primary keys (numbers), not strings
          STUDENT_ID: student.STUDENT_ID,
          STUDENT: student.STUDENT_ID, // Use ID as required by backend
          // Use student id as roll number when no separate roll numbers table exists
          ROLL_NUMBER: student.STUDENT_ID,
          ROLL_NO: student.STUDENT_ID,
          ACADEMIC_YEAR_ID: academicYearIdNum,
          ACADEMIC_YEAR: formData.academicYear || "", // Use actual academic year string, not ID
          BRANCH_ID: branchIdNum,
          BRANCH: branchIdNum, // Use ID as required by backend
          INSTITUTE_ID: instituteIdNum,
          INSTITUTE: instituteIdNum, // Use ID as required by backend
          SEMESTER_ID: semesterIdNum,
          SEMESTER: semesterIdNum, // Use ID as required by backend
          YEAR_ID: yearIdNum,
          YEAR: yearIdNum // Use ID as required by backend
        };
      });

      console.log("Sending payload:", payload);

      const response = await axiosInstance.post("/api/master/rollnumbers/", payload);
      console.log("Response:", response);
      
      setMessage({ type: 'success', text: 'Roll numbers saved successfully!' });
    } catch (error: any) {
      console.warn("Error saving roll numbers:", error);
      let errorMessage = 'Failed to save roll numbers. Please check your data and try again.';
      if (isAxiosError(error) && error.response) {
        if (error.response.data && error.response.data.errors) {
          const errorDetails = JSON.stringify(error.response.data.errors, null, 2);
          errorMessage = `Validation errors: ${errorDetails}`;
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      setMessage({ type: 'warn', text: errorMessage });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow">
        <h2 className="text-primary mb-4">Student Roll Number Entry</h2>
        {message && (
          <div
            className={`mb-3 alert ${
              message.type === 'success' ? 'alert-success' : message.type === 'warn' ? 'alert-warning' : 'alert-info'
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}
        <form className="row g-3">
          {/* Academic Year */}
          <div className="col-md-6">
            <label className="form-label">Academic Year</label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.ACADEMIC_YEAR_ID} value={year.ACADEMIC_YEAR}>  
                  {year.ACADEMIC_YEAR}
                </option>
              ))}
            </select>
          </div>

          {/* University */}
          <div className="col-md-6">
            <label className="form-label">University</label>
            <select
              name="universityId"
              value={formData.universityId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select University</option>
              {universities.map((university) => (
                <option
                  key={university.UNIVERSITY_ID}
                  value={university.UNIVERSITY_ID}
                >
                  {university.NAME}
                </option>
              ))}
            </select>
          </div>

          {/* Institute */}
          <div className="col-md-6">
            <label className="form-label">Institute</label>
            <select
              name="instituteId"
              value={formData.instituteId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Institute</option>
              {institutes.map((institute) => (
                <option
                  key={institute.INSTITUTE_ID}
                  value={institute.INSTITUTE_ID}
                >
                  {institute.CODE}
                </option>
              ))}
            </select>
          </div>

          {/* Program */}
          <div className="col-md-6">
            <label className="form-label">Program</label>
            <select
              name="programId"
              value={formData.programId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.PROGRAM_ID} value={program.PROGRAM_ID}>
                  {program.NAME}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="col-md-6">
            <label className="form-label">Branch</label>
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.BRANCH_ID} value={branch.BRANCH_ID}>
                  {branch.NAME}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="col-md-6">
            <label className="form-label">Year</label>
            <select
              name="yearId"
              value={formData.yearId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year.YEAR_ID} value={year.YEAR_ID}>
                  {year.YEAR}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="col-md-6">
            <label className="form-label">Semester</label>
            <select
              name="semesterId"
              value={formData.semesterId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester.SEMESTER_ID} value={semester.SEMESTER_ID}>
                  {semester.SEMESTER}
                </option>
              ))}
            </select>
          </div>

          {/* Show Students Button */}
          <div className="col-12">
            <button type="button" className="btn btn-primary w-100" onClick={handleShow}>
              Show Students
            </button>
          </div>

          {students.length > 0 && (
            <div className="col-12 mt-4">
              <table className="table">
                <thead className="table-light">
                          <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Branch</th>
                            <th>Father's Name</th>
                            <th>Surname</th>
                          </tr>
                </thead>
                <tbody>
                          {students.map((student) => (
                            <tr key={student.STUDENT_ID}>
                              <td>{student.STUDENT_ID}</td>
                              <td>{student.NAME}</td>
                              <td>
                                {(
                                  // Try several shapes: nested object, id, or simple string
                                  student.BRANCH?.NAME || student.BRANCH?.BRANCH_NAME || student.BRANCH_ID?.NAME || student.BRANCH_ID || student.BRANCH || 'N/A'
                                )}
                              </td>
                              <td>{student.FATHER_NAME}</td>
                              <td>{student.SURNAME}</td>
                            </tr>
                          ))}
                </tbody>
              </table>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default StudentRollForm;