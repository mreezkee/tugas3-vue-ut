const ApiService = {
  // Fungsi untuk mengambil data dari JSON
  fetchDataBahanAjar: async function () {
    try {
      const response = await fetch("./data/dataBahanAjar.json");

      if (!response.ok) {
        throw new Error("Gagal mengambil data JSON");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Terjadi kesalahan pada jalur data:", error);
      return null; // Kembalikan nilai kosong jika gagal
    }
  },
};
