var app = new Vue({
  el: "#app",
  data: {
    tab: localStorage.getItem("tabAktif") || "beranda",
    sidebarOpen: false,
    tanggalHariIni: "",
    isDarkMode: false,

    stok: [],
    tracking: [],
    paket: [],
    upbjjList: [],
    kategoriList: [],
    pengirimanList: [],
  },

  watch: {
    tab: function (tabBaru) {
      localStorage.setItem("tabAktif", tabBaru);
    },
  },

  mounted: async function () {
    //Fungsi tanggal otomatis
    this.setTanggalDinamis();
    if (localStorage.getItem("temaSitta") === "dark") {
      this.isDarkMode = true;
      document.body.classList.add("dark-mode"); // Pasang mode gelap
    }

    //Proses Load data dari JSON
    console.log("Memulai proses load data JSON...");
    const dataMentah = await ApiService.fetchDataBahanAjar();

    if (dataMentah) {
      this.stok = dataMentah.stok || [];
      this.tracking = dataMentah.tracking || [];
      this.paket = dataMentah.paket || [];
      this.upbjjList = dataMentah.upbjjList || [];
      this.kategoriList = dataMentah.kategoriList || [];
      this.pengirimanList = dataMentah.pengirimanList || [];
      console.log("Data JSON berhasil dimuat:", this.stok);
    }
  },

  methods: {
    setTanggalDinamis: function () {
      const opsi = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      this.tanggalHariIni = new Date().toLocaleDateString("id-ID", opsi);
    },

    toggleTheme: function () {
      this.isDarkMode = !this.isDarkMode; // Balikkan status (true jadi false, false jadi true)

      if (this.isDarkMode) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("temaSitta", "dark"); // Simpan ke memori
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("temaSitta", "light"); // Simpan ke memori
      }
    },
  },

  computed: {
    totalStok: function () {
      return this.stok.reduce(
        (total, item) => total + (Number(item.qty) || 0),
        0,
      );
    },

    jumlahKosong: function () {
      return this.stok.filter((item) => item.qty === 0).length;
    },

    jumlahMenipis: function () {
      return this.stok.filter((item) => item.qty > 0 && item.qty < item.safety)
        .length;
    },

    doAktif: function () {
      let jumlahAktif = 0;
      this.tracking.forEach((item) => {
        let noDO = Object.keys(item)[0];
        if (item[noDO].status !== "Sudah Diterima") {
          jumlahAktif++;
        }
      });
      return jumlahAktif;
    },
  },
});
