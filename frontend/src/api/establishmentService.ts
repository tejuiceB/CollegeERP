import axios from "./axios";

export interface MasterTable {
  name: string;
  display_name: string;
  endpoint: string;
}

export interface MasterEntry {
  id: number;
  type: string;
  name?: string;
  description: string;
  is_active: boolean;
}

const API_URL = "http://localhost:8000/api";

export const getEmployeeMasterTables = async (): Promise<MasterTable[]> => {
  try {
    const response = await axios.get(`${API_URL}/establishment/masters/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching master tables:", error);
    return [];
  }
};

export const getMasterTableData = async (
  tableName: string
): Promise<MasterEntry[]> => {
  try {
    const response = await axios.get(`${API_URL}/establishment/${tableName}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${tableName} data:`, error);
    return [];
  }
};

export const addMasterEntry = async (
  tableName: string,
  data: Partial<MasterEntry>
): Promise<MasterEntry> => {
  const response = await axios.post(
    `${API_URL}/establishment/${tableName}/`,
    data
  );
  return response.data;
};

export const updateMasterEntry = async (
  tableName: string,
  id: number,
  data: Partial<MasterEntry>
): Promise<MasterEntry> => {
  const response = await axios.put(
    `${API_URL}/establishment/${tableName}/${id}/`,
    data
  );
  return response.data;
};

export const deleteMasterEntry = async (
  tableName: string,
  id: number
): Promise<void> => {
  await axios.delete(`${API_URL}/establishment/${tableName}/${id}/`);
};

export const toggleStatus = async (
  tableName: string,
  id: number,
  status: boolean
): Promise<MasterEntry> => {
  const response = await axios.patch(
    `${API_URL}/establishment/${tableName}/${id}/`,
    {
      is_active: status,
    }
  );
  return response.data;
};

// Add these new exports for Type entries
export const fetchTypeEntries = () =>
  axios.get(`${API_URL}/establishment/type-master/`);

export const createTypeEntry = (data: { RECORD_WORD: string }) =>
  axios.post(`${API_URL}/establishment/type-master/`, data);

// Add these new exports for Status entries
export const fetchStatusEntries = () =>
  axios.get(`${API_URL}/establishment/status-master/`);

export const createStatusEntry = (data: { RECORD_WORD: string }) =>
  axios.post(`${API_URL}/establishment/status-master/`, data);

// Add these new exports for Shift entries
export const fetchShiftEntries = () =>
  axios.get(`${API_URL}/establishment/shift-master/`);

export const createShiftEntry = (data: {
  SHIFT_NAME: string;
  FROM_TIME: string;
  TO_TIME: string;
  LATE_COMING_TIME?: string;
  EARLY_GOING_TIME?: string;
}) => axios.post(`${API_URL}/establishment/shift-master/`, data);

// Add these exports for update operations
export const updateTypeEntry = (id: number, data: { RECORD_WORD: string }) =>
  axios.put(`${API_URL}/establishment/type-master/${id}/`, data);

export const updateStatusEntry = (id: number, data: { RECORD_WORD: string }) =>
  axios.put(`${API_URL}/establishment/status-master/${id}/`, data);

export const updateShiftEntry = (
  id: number,
  data: {
    SHIFT_NAME: string;
    FROM_TIME: string;
    TO_TIME: string;
    LATE_COMING_TIME?: string;
    EARLY_GOING_TIME?: string;
  }
) => axios.put(`${API_URL}/establishment/shift-master/${id}/`, data);

// Add these functions
export const deleteTypeEntry = (id: number) => {
  return axios.delete(`${API_URL}/establishment/type-master/${id}/`);
};

export const deleteStatusEntry = (id: number) => {
  return axios.delete(`${API_URL}/establishment/status-master/${id}/`);
};

export const deleteShiftEntry = (id: number) => {
  return axios.delete(`${API_URL}/establishment/shift-master/${id}/`);
};
