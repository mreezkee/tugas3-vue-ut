var app = new Vue({
  el: "#app",
  data: {
    sidebarOpen: false,
    tanggalHariIni: "",
    isDarkMode: false,
    // Dummy data Stok
    stok: [
      {
        kode: "EKMA4116",
        judul: "Pengantar Manajemen",
        kategori: "MK Wajib",
        upbjj: "Jakarta",
        lokasiRak: "R1-A3",
        harga: 65000,
        qty: 28,
        safety: 20,
        catatanHTML: "<em>Edisi 2024, cetak ulang</em>",
      },
      {
        kode: "EKMA4115",
        judul: "Pengantar Akuntansi",
        kategori: "MK Wajib",
        upbjj: "Jakarta",
        lokasiRak: "R1-A4",
        harga: 60000,
        qty: 7,
        safety: 15,
        catatanHTML: "<strong>Cover baru</strong>",
      },
      {
        kode: "BIOL4201",
        judul: "Biologi Umum (Praktikum)",
        kategori: "Praktikum",
        upbjj: "Surabaya",
        lokasiRak: "R3-B2",
        harga: 80000,
        qty: 12,
        safety: 10,
        catatanHTML: "Butuh <u>pendingin</u> untuk kit basah",
      },
      {
        kode: "FISIP4001",
        judul: "Dasar-Dasar Sosiologi",
        kategori: "MK Pilihan",
        upbjj: "Makassar",
        lokasiRak: "R2-C1",
        harga: 55000,
        qty: 2,
        safety: 8,
        catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder",
      },
    ],
    //Data Dummy Riwayat DO
    riwayatDO: [
      {
        noDO: "DO2026-001",
        nim: "012345678",
        nama: "Vino G. Bastian",
        namaPaket: "PAKET IPS Dasar",
        kodePaket: "PAKET-UT-001",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-20",
        totalHarga: 120000,
        status: "Dikirim",
      },
      {
        noDO: "DO2026-002",
        nim: "012345679",
        nama: "M. Rizqi Pratama",
        namaPaket: "PAKET IPA Dasar",
        kodePaket: "PAKET-UT-002",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-22",
        totalHarga: 140000,
        status: "Penjemputan",
      },
      {
        noDO: "DO2026-003",
        nim: "012345680",
        nama: "Lionel Messi",
        namaPaket: "PAKET IPA Dasar",
        kodePaket: "PAKET-UT-002",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-22",
        totalHarga: 140000,
        status: "Proses Gudang",
      },
      {
        noDO: "DO2026-004",
        nim: "012345681",
        nama: "Adit",
        namaPaket: "PAKET IPS Dasar",
        kodePaket: "PAKET-UT-001",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-22",
        totalHarga: 120000,
        status: "Sudah Diterima",
      },
    ],
  },

  mounted: function () {
    //Fungsi tanggal otomatis
    this.setTanggalDinamis();
    if (localStorage.getItem("temaSitta") === "dark") {
      this.isDarkMode = true;
      document.body.classList.add("dark-mode"); // Pasang mode gelap
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
      return this.riwayatDO.filter((item) => item.status !== "Selesai").length;
    },
  },
});
