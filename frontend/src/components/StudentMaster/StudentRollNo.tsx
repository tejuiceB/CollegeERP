import React, { useState, useEffect, ChangeEvent } from "react";
import axiosInstance from "../../api/axios";

interface FormData {
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
  }
  
  const [students, setStudents] = useState<Student[]>([]);
  const [rollNumbers, setRollNumbers] = useState<{ [key: number]: string }>({});

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
      if (response.status === 200) setAcademicYears(response.data);
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

  // For fetching students based on selected branch and academic year after clicking the Show button
  // This function fetches students based on the selected branch and academic year 
  const fetchStudents = async () => {
    if (!formData.branchId || !formData.academicYear) {
      alert("Please select both Branch and Academic Year.");
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
      console.error("Error fetching students:", error);
      alert("Failed to fetch students. Please try again.");
    }
  };
  
  
  

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShow = async () => {
    
    if (!formData.branchId || !formData.academicYear) {
      alert("Please select both Branch and Academic Year.");
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/api/student/?branch_id=${formData.branchId}&academic_year=${formData.academicYear}`
      );
      if (response.status === 200 && response.data.status === "success") {
        setStudents(response.data.data);
        
        const rollResponse = await axiosInstance.get(
          `/api/master/rollnumbers/?branch_id=${formData.branchId}&academic_year=${formData.academicYear}`
        );
        if (rollResponse.status === 200) {
          const rollData = rollResponse.data.reduce((acc: { [x: string]: any; }, student: { STUDENT_ID: string | number; ROLL_NUMBER: string; }) => {
            acc[student.STUDENT_ID] = student.ROLL_NUMBER || "";
            return acc;
          }, {});
          setRollNumbers(rollData);
        }
      }
    } catch (error) {
      console.error("Error fetching students or roll numbers:", error);
    }
  };

  

  const handleRollNumberChange = (studentId: any, value: any) => {
    setRollNumbers((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = students.map((student) => ({
        student: student.STUDENT_ID,
        roll_no: rollNumbers[student.ROLL_NO] || "",
        academic_year: parseInt(formData.academicYear),
        branch: parseInt(formData.branchId),
        institute: parseInt(formData.instituteId),
        semester: parseInt(formData.semesterId),
        year: parseInt(formData.yearId),
      }));
  
      await axiosInstance.post("/api/master/rollnumbers/", payload);
      alert("Roll numbers saved successfully!");
    } catch (error) {
      console.error("Error saving roll numbers:");
      alert("Failed to save roll numbers.");
    }
  };
  
  

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow">
        <h2 className="text-primary mb-4">Student Roll Number Entry</h2>
        <form className="row g-3">
          {/* Academic Year */}
          <div className="col-md-6">
            <label className="form-label">Academic Year</label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className="form-select"
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
            <button type="button" className="btn btn-success w-100" onClick={handleShow}>
          Show
        </button>
        {students.length > 0 && (
          <table className="table mt-4">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Father's Name</th>
                <th>Surname</th>
                <th>Roll Number</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.STUDENT_ID}>
                  <td>{student.STUDENT_ID}</td>
                  <td>{student.NAME}</td>
                  <td>{student.FATHER_NAME}</td>
                  <td>{student.SURNAME}</td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={rollNumbers[student.STUDENT_ID] || ""}
                      onChange={(e) => handleRollNumberChange(student.STUDENT_ID, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
          {/* Save Button */}
          <div className="col-12">
            <button
              type="button"
              className="btn btn-success w-100"
              onClick={handleSave}
            >
              submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRollForm;
