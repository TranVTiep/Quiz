import axiosClient from "./axiosClient";

const liveApi = {
  // Lấy danh sách lịch sử các phòng Live
  getHistory: () => {
    return axiosClient.get("/live/history");
  },
  // Lấy chi tiết 1 phòng cụ thể
  getRoomDetail: (id) => {
    return axiosClient.get(`/live/${id}`);
  },
};

export default liveApi;
