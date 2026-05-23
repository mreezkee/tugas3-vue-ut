var app = new Vue({
  el: "#app",
  // DATA (Tempat Menyimpan Variabel)
  data: {
    upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
    kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
    pengirimanList: [
      { kode: "REG", nama: "Reguler (3-5 hari)" },
      { kode: "EXP", nama: "Ekspres (1-2 hari)" },
    ],
    paket: [
      {
        kode: "PAKET-UT-001",
        nama: "PAKET IPS Dasar",
        isi: ["EKMA4116", "EKMA4115"],
        harga: 120000,
      },
      {
        kode: "PAKET-UT-002",
        nama: "PAKET IPA Dasar",
        isi: ["BIOL4201", "FISIP4001"],
        harga: 140000,
      },
    ],
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

    // VARIABEL PENAMPUNG FILTER (Terkoneksi dengan v-model di HTML)
    filterUpbjj: "",
    filterKategori: "",
    filterStatus: "",
    sortBy: "judul_asc",

    //Aktivitas Watcher 2
    logAktivitas: "Siap memantau aktivitas filter...",

    //Aktivitas Tambah Bahan Ajar
    showModal: false,
    sidebarOpen: false,
    baruBuku: {
      kode: "",
      judul: "",
      kategori: "",
      upbjj: "",
      lokasiRak: "",
      harga: null,
      qty: null,
      safety: null,
      catatanHTML: "",
    },

    //variable edit & animasi
    isEditMode: false,
    kodeYangDiedit: null,
    isProcessing: false,
    isSuccess: false,

    //Variable penampung form
  },

  mounted: function () {
    // Cek ingatan browser saat halaman dimuat
    if (localStorage.getItem("temaSitta") === "dark") {
      document.body.classList.add("dark-mode");
    }
  },
  //WATCHERS (Memantau Perubahan Data)
  watch: {
    // Watcher 1: Jika pilihan UT Daerah berubah, otomatis reset Kategori MK ke "Semua"
    filterUpbjj: function (nilaiBaru) {
      this.filterKategori = "";

      if (nilaiBaru !== "") {
        this.logAktivitas = "Memilih UT Daerah: " + nilaiBaru;
      } else {
        this.logAktivitas = "Mereset UT Daerah";
      }
    },

    // Watcher 2: Memantau Kategori
    filterKategori: function (nilaiBaru) {
      if (nilaiBaru !== "") {
        this.logAktivitas = "Menyaring Kategori: " + nilaiBaru;
      }
    },

    // Watcher 3: Memantau Status
    filterStatus: function (nilaiBaru) {
      if (nilaiBaru !== "") {
        this.logAktivitas = "Menyaring Status: " + nilaiBaru;
      }
    },
  },

  //COMPUTED PROPERTY (Logika Filter & Sort Otomatis)

  computed: {
    stokTersaring: function () {
      // A. Salin data asli agar data mentah tidak rusak
      let dataHasil = [...this.stok];

      // B. Filter berdasarkan UT Daerah
      if (this.filterUpbjj !== "") {
        dataHasil = dataHasil.filter((buku) => buku.upbjj === this.filterUpbjj);
      }

      // C. Filter berdasarkan Kategori MK
      if (this.filterKategori !== "") {
        dataHasil = dataHasil.filter(
          (buku) => buku.kategori === this.filterKategori,
        );
      }

      // D. Filter berdasarkan Status (Logika Inti Re-order)
      if (this.filterStatus === "reorder") {
        // Menampilkan qty yang lebih kecil dari safety stock ATAU 0
        dataHasil = dataHasil.filter((buku) => buku.qty < buku.safety);
      } else if (this.filterStatus === "kosong") {
        dataHasil = dataHasil.filter((buku) => buku.qty === 0);
      } else if (this.filterStatus === "menipis") {
        dataHasil = dataHasil.filter(
          (buku) => buku.qty > 0 && buku.qty < buku.safety,
        );
      }

      // E. Logika Pengurutan (Sort)
      dataHasil.sort((a, b) => {
        if (this.sortBy === "judul_asc") return a.judul.localeCompare(b.judul);
        if (this.sortBy === "judul_desc") return b.judul.localeCompare(a.judul);
        if (this.sortBy === "stok_asc") return a.qty - b.qty;
        if (this.sortBy === "stok_desc") return b.qty - a.qty;
        if (this.sortBy === "harga_asc") return a.harga - b.harga;
        if (this.sortBy === "harga_desc") return b.harga - a.harga;
      });

      return dataHasil;
    },
  },

  // 4. METHODS (Fungsi Aksi Manual)

  methods: {
    //Fungsi membuka modal mode edit
    bukaModalEdit: function (buku) {
      this.isEditMode = true;
      this.kodeYangDiedit = buku.kode;

      // Salin data buku yang dipilih ke dalam wadah baruBuku
      this.baruBuku = { ...buku };

      this.showModal = true;
    },

    bukaModalTambah: function () {
      this.isEditMode = false;
      this.kodeYangDiedit = null;
      // Kosongkan form untuk persiapan input data baru
      this.baruBuku = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: null,
        qty: null,
        safety: null,
        catatanHTML: "",
      };
      this.showModal = true;
    },

    // Fungsi menutup modal dan mereset form (Bisa dipasang di tombol X atau Batal)
    tutupModal: function () {
      this.showModal = false;
      this.isEditMode = false;
      this.kodeYangDiedit = null;
      this.baruBuku = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: null,
        qty: null,
        safety: null,
        catatanHTML: "",
      };
    },

    // Fungsi ini dipanggil saat tombol Reset diklik
    resetFilter: function () {
      this.filterUpbjj = "";
      this.filterKategori = "";
      this.filterStatus = "";
      this.sortBy = "judul_asc";
    },

    //Fungsi simpan Buku
    simpanBuku: function () {
      // Tutup modal secara otomatis
      this.showModal = false;
      this.isProcessing = true;

      setTimeout(() => {
        this.isProcessing = false;
        this.isSuccess = true;

        if (this.isEditMode === true) {
          let index = this.stok.findIndex(
            (item) => item.kode === this.kodeYangDiedit,
          );

          if (index != -1) {
            //Jika ketemu Timpah
            this.stok.splice(index, 1, { ...this.baruBuku });
          }
        } else {
          // Memasukkan objek baru ke dalam array stok asli
          this.stok.push({ ...this.baruBuku });
        }

        this.isEditMode = false;
        this.kodeYangDiedit = null;
        // Reset kembali isi form agar kosong saat dibuka lagi nanti
        this.baruBuku = {
          kode: "",
          judul: "",
          kategori: "",
          upbjj: "",
          lokasiRak: "",
          harga: null,
          qty: null,
          safety: null,
          catatanHTML: "",
        };

        setTimeout(() => {
          this.isSuccess = false;
        }, 1500);
      }, 1500);
    },
  },
});
